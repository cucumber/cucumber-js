import getColorFns from './get_color_fns'
import ProgressBarFormatter from './progress_bar_formatter'
import Status from '../status'
import { EventEmitter } from 'events'
import Gherkin from 'gherkin'
import { EventDataCollector } from './helpers'

describe('ProgressBarFormatter', function() {
  beforeEach(function() {
    this.eventBroadcaster = new EventEmitter()
    this.output = ''
    const logFn = data => {
      this.output += data
    }
    const colorFns = getColorFns(false)
    this.progressBarFormatter = new ProgressBarFormatter({
      colorFns,
      cwd: 'path/to/project',
      eventBroadcaster: this.eventBroadcaster,
      eventDataCollector: new EventDataCollector(this.eventBroadcaster),
      log: logFn,
      snippetBuilder: createMock({ build: 'snippet' }),
      stream: {}
    })
  })

  describe('pickle-accepted, test-case-started', function() {
    beforeEach(function() {
      this.eventBroadcaster.emit('pickle-accepted', {
        pickle: { locations: [{ line: 2 }], steps: [1, 2, 3] },
        uri: 'path/to/feature'
      })
      this.eventBroadcaster.emit('pickle-accepted', {
        pickle: { locations: [{ line: 7 }], steps: [4, 5] },
        uri: 'path/to/feature'
      })
      this.eventBroadcaster.emit('test-case-started')
    })

    it('initializes a progress bar with the total number of steps', function() {
      expect(this.progressBarFormatter.progressBar.total).to.eql(5)
    })
  })

  describe('test-step-finished', function() {
    beforeEach(function() {
      this.progressBarFormatter.progressBar = {
        interrupt: sinon.stub(),
        tick: sinon.stub()
      }
      this.eventBroadcaster.emit('test-case-prepared', {
        sourceLocation: { line: 2, uri: 'path/to/feature' },
        steps: [
          { actionLocation: { line: 2, uri: 'path/to/steps' } },
          {
            actionLocation: { line: 2, uri: 'path/to/steps' },
            sourceLocation: { line: 3, uri: 'path/to/feature' }
          }
        ]
      })
    })

    describe('step is a hook', function() {
      beforeEach(function() {
        this.eventBroadcaster.emit('test-step-finished', {
          index: 0,
          testCase: {
            sourceLocation: { line: 2, uri: 'path/to/feature' }
          },
          result: { status: Status.PASSED }
        })
      })

      it('does not increase the progress bar percentage', function() {
        expect(this.progressBarFormatter.progressBar.tick).not.to.have.been
          .called
      })
    })

    describe('step is a normal step', function() {
      beforeEach(function() {
        this.eventBroadcaster.emit('test-step-finished', {
          index: 1,
          testCase: {
            sourceLocation: { line: 2, uri: 'path/to/feature' }
          },
          result: { status: Status.PASSED }
        })
      })

      it('increases the progress bar percentage', function() {
        expect(this.progressBarFormatter.progressBar.tick).to.have.been
          .calledOnce
      })
    })
  })

  describe('test-case-finished', function() {
    beforeEach(function() {
      this.progressBarFormatter.progressBar = {
        interrupt: sinon.stub(),
        tick: sinon.stub()
      }
      const events = Gherkin.generateEvents(
        'Feature: a\nScenario: b\nGiven a step',
        'a.feature'
      )
      events.forEach(event => {
        this.eventBroadcaster.emit(event.type, event)
        if (event.type === 'pickle') {
          this.eventBroadcaster.emit('pickle-accepted', {
            type: 'pickle-accepted',
            pickle: event.pickle,
            uri: event.uri
          })
        }
      })
      this.testCase = { sourceLocation: { uri: 'a.feature', line: 2 } }
    })

    describe('ambiguous', function() {
      beforeEach(function() {
        this.eventBroadcaster.emit('test-case-prepared', {
          sourceLocation: this.testCase.sourceLocation,
          steps: [
            {
              sourceLocation: { uri: 'a.feature', line: 3 }
            }
          ]
        })
        this.eventBroadcaster.emit('test-step-finished', {
          index: 0,
          testCase: this.testCase,
          result: {
            exception:
              'Multiple step definitions match:\n' +
              '  pattern1        - steps.js:3\n' +
              '  longer pattern2 - steps.js:4',
            status: Status.AMBIGUOUS
          }
        })
        this.eventBroadcaster.emit('test-case-finished', {
          sourceLocation: this.testCase.sourceLocation,
          result: { status: Status.AMBIGUOUS }
        })
      })

      it('prints the error', function() {
        expect(this.progressBarFormatter.progressBar.interrupt).to.have.been
          .calledOnce
      })
    })

    describe('failed', function() {
      beforeEach(function() {
        this.eventBroadcaster.emit('test-case-prepared', {
          sourceLocation: this.testCase.sourceLocation,
          steps: [
            {
              sourceLocation: { uri: 'a.feature', line: 3 },
              actionLocation: { uri: 'steps.js', line: 4 }
            }
          ]
        })
        this.eventBroadcaster.emit('test-step-finished', {
          index: 0,
          testCase: this.testCase,
          result: { exception: 'error', status: Status.FAILED }
        })
        this.eventBroadcaster.emit('test-case-finished', {
          sourceLocation: this.testCase.sourceLocation,
          result: { status: Status.FAILED }
        })
      })

      it('prints the error', function() {
        expect(this.progressBarFormatter.progressBar.interrupt).to.have.been
          .calledOnce
      })
    })

    describe('passed', function() {
      beforeEach(function() {
        this.eventBroadcaster.emit('test-case-prepared', {
          sourceLocation: this.testCase.sourceLocation,
          steps: [
            {
              sourceLocation: { uri: 'a.feature', line: 3 },
              actionLocation: { uri: 'steps.js', line: 4 }
            }
          ]
        })
        this.eventBroadcaster.emit('test-step-finished', {
          index: 0,
          testCase: this.testCase,
          result: { status: Status.PASSED }
        })
        this.eventBroadcaster.emit('test-case-finished', {
          sourceLocation: this.testCase.sourceLocation,
          result: { status: Status.PASSED }
        })
      })

      it('does not print anything', function() {
        expect(this.progressBarFormatter.progressBar.interrupt).not.to.have.been
          .called
      })
    })

    describe('pending', function() {
      beforeEach(function() {
        this.eventBroadcaster.emit('test-case-prepared', {
          sourceLocation: this.testCase.sourceLocation,
          steps: [
            {
              sourceLocation: { uri: 'a.feature', line: 3 },
              actionLocation: { uri: 'steps.js', line: 4 }
            }
          ]
        })
        this.eventBroadcaster.emit('test-step-finished', {
          index: 0,
          testCase: this.testCase,
          result: { status: Status.PENDING }
        })
        this.eventBroadcaster.emit('test-case-finished', {
          sourceLocation: this.testCase.sourceLocation,
          result: { status: Status.PENDING }
        })
      })

      it('prints the warning', function() {
        expect(this.progressBarFormatter.progressBar.interrupt).to.have.been
          .calledOnce
      })
    })

    describe('skipped', function() {
      beforeEach(function() {
        this.eventBroadcaster.emit('test-case-prepared', {
          sourceLocation: this.testCase.sourceLocation,
          steps: [
            {
              sourceLocation: { uri: 'a.feature', line: 3 },
              actionLocation: { uri: 'steps.js', line: 4 }
            }
          ]
        })
        this.eventBroadcaster.emit('test-step-finished', {
          index: 0,
          testCase: this.testCase,
          result: { status: Status.SKIPPED }
        })
        this.eventBroadcaster.emit('test-case-finished', {
          sourceLocation: this.testCase.sourceLocation,
          result: { status: Status.SKIPPED }
        })
      })

      it('does not print anything', function() {
        expect(this.progressBarFormatter.progressBar.interrupt).not.to.have.been
          .called
      })
    })

    describe('undefined', function() {
      beforeEach(function() {
        this.eventBroadcaster.emit('test-case-prepared', {
          sourceLocation: this.testCase.sourceLocation,
          steps: [
            {
              sourceLocation: { uri: 'a.feature', line: 3 }
            }
          ]
        })
        this.eventBroadcaster.emit('test-step-finished', {
          index: 0,
          testCase: this.testCase,
          result: { status: Status.UNDEFINED }
        })
        this.eventBroadcaster.emit('test-case-finished', {
          sourceLocation: this.testCase.sourceLocation,
          result: { status: Status.UNDEFINED }
        })
      })

      it('prints the warning', function() {
        expect(this.progressBarFormatter.progressBar.interrupt).to.have.been
          .calledOnce
      })
    })
  })

  describe('test-run-finished', function() {
    beforeEach(function() {
      this.eventBroadcaster.emit('test-run-finished', {
        result: { duration: 0 }
      })
    })

    it('outputs step totals, scenario totals, and duration', function() {
      expect(this.output).to.contain(
        '0 scenarios\n' + '0 steps\n' + '0m00.000s\n'
      )
    })
  })
})
