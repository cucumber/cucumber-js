import { beforeEach, describe, it } from 'mocha'
import { expect } from 'chai'
import { createMock } from './test_helpers'
import sinon from 'sinon'
import getColorFns from './get_color_fns'
import ProgressBarFormatter from './progress_bar_formatter'
import Status from '../status'
import { EventEmitter } from 'events'
import { generateEvents } from '../../test/gherkin_helpers'
import { EventDataCollector } from './helpers'
import { messages } from 'cucumber-messages'
import uuidv4 from 'uuid/v4'

describe('ProgressBarFormatter', () => {
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
      stream: {},
    })
  })

  describe('pickleAccepted / testStepStarted', () => {
    beforeEach(async function() {
      await generateEvents({
        data: 'Feature: a\nScenario: b\nGiven a step\nThen a step',
        eventBroadcaster: this.eventBroadcaster,
        uri: '/project/a.feature',
      })
      await generateEvents({
        data: 'Feature: a\nScenario: b\nGiven a step\nWhen a step\nThen a step',
        eventBroadcaster: this.eventBroadcaster,
        uri: '/project/b.feature',
      })
      this.eventBroadcaster.emit(
        'envelope',
        messages.Envelope.fromObject({
          testStepStarted: {},
        })
      )
    })

    it('initializes a progress bar with the total number of steps', function() {
      expect(this.progressBarFormatter.progressBar.total).to.eql(5)
    })
  })

  describe('test-step-finished', () => {
    beforeEach(async function() {
      this.progressBarFormatter.progressBar = {
        interrupt: sinon.stub(),
        tick: sinon.stub(),
      }

      const {
        pickles: [pickle],
      } = await generateEvents({
        data: 'Feature: a\nScenario: b\nGiven a step',
        eventBroadcaster: this.eventBroadcaster,
        uri: 'a.feature',
      })
      this.pickle = pickle
      const testCaseId = uuidv4()
      this.testCaseStartedId = uuidv4()
      this.testStepId1 = uuidv4()
      this.testStepId2 = uuidv4()
      this.eventBroadcaster.emit(
        'envelope',
        messages.Envelope.fromObject({
          testCase: {
            id: testCaseId,
            pickleId: this.pickle.id,
            testSteps: [
              { id: this.testStepId1 },
              { id: this.testStepId2, pickleStepId: this.pickle.steps[0].id },
            ],
          },
        })
      )
      this.eventBroadcaster.emit(
        'envelope',
        messages.Envelope.fromObject({
          testCaseStarted: {
            testCaseId,
            attempt: 0,
            id: this.testCaseStartedId,
          },
        })
      )
    })

    describe('step is a hook', () => {
      beforeEach(function() {
        this.eventBroadcaster.emit(
          'envelope',
          messages.Envelope.fromObject({
            testStepFinished: {
              testCaseStartedId: this.testCaseStartedId,
              testStepId: this.testStepId1,
              testResult: { status: Status.PASSED },
            },
          })
        )
      })

      it('does not increase the progress bar percentage', function() {
        expect(this.progressBarFormatter.progressBar.tick).to.have.callCount(0)
      })
    })

    describe('step is from a pickle', () => {
      beforeEach(function() {
        this.eventBroadcaster.emit(
          'envelope',
          messages.Envelope.fromObject({
            testStepFinished: {
              testCaseStartedId: this.testCaseStartedId,
              testStepId: this.testStepId2,
              testResult: { status: Status.PASSED },
            },
          })
        )
      })

      it('increases the progress bar percentage', function() {
        expect(this.progressBarFormatter.progressBar.tick).to.have.callCount(1)
      })
    })
  })

  describe('test-case-finished', () => {
    beforeEach(async function() {
      this.progressBarFormatter.progressBar = {
        interrupt: sinon.stub(),
        tick: sinon.stub(),
      }

      const {
        pickles: [pickle],
      } = await generateEvents({
        data: 'Feature: a\nScenario: b\nGiven a step',
        eventBroadcaster: this.eventBroadcaster,
        uri: 'a.feature',
      })
      this.pickle = pickle
      this.testCaseId = uuidv4()
      this.testCaseStartedId = uuidv4()
      this.testStepId = uuidv4()
      this.eventBroadcaster.emit(
        'envelope',
        messages.Envelope.fromObject({
          testCase: {
            id: this.testCaseId,
            pickleId: this.pickle.id,
            testSteps: [
              {
                id: this.testStepId,
                pickleStepId: this.pickle.steps[0].id,
                stepDefinitionId: [],
              },
            ],
          },
        })
      )
      this.eventBroadcaster.emit(
        'envelope',
        messages.Envelope.fromObject({
          testCaseStarted: {
            testCaseId: this.testCaseId,
            attempt: 0,
            id: this.testCaseStartedId,
          },
        })
      )
    })

    describe('ambiguous', () => {
      beforeEach(function() {
        const testResult = {
          exception:
            'Multiple step definitions match:\n' +
            '  pattern1        - steps.js:3\n' +
            '  longer pattern2 - steps.js:4',
          status: Status.AMBIGUOUS,
        }
        this.eventBroadcaster.emit(
          'envelope',
          messages.Envelope.fromObject({
            testStepFinished: {
              testCaseStartedId: this.testCaseStartedId,
              testStepId: this.testStepId,
              testResult,
            },
          })
        )
        this.eventBroadcaster.emit(
          'envelope',
          messages.Envelope.fromObject({
            testCaseFinished: {
              testCaseStartedId: this.testCaseStartedId,
              testResult,
            },
          })
        )
      })

      it('prints the error', function() {
        expect(
          this.progressBarFormatter.progressBar.interrupt
        ).to.have.callCount(1)
      })
    })

    describe('failed', () => {
      beforeEach(function() {
        const testResult = { exception: 'error', status: Status.FAILED }
        this.eventBroadcaster.emit(
          'envelope',
          messages.Envelope.fromObject({
            testStepFinished: {
              testCaseStartedId: this.testCaseStartedId,
              testStepId: this.testStepId,
              testResult,
            },
          })
        )
        this.eventBroadcaster.emit(
          'envelope',
          messages.Envelope.fromObject({
            testCaseFinished: {
              testCaseStartedId: this.testCaseStartedId,
              testResult,
            },
          })
        )
      })

      it('prints the error', function() {
        expect(
          this.progressBarFormatter.progressBar.interrupt
        ).to.have.callCount(1)
      })
    })

    describe('retried', () => {
      beforeEach(function() {
        const testResult = { exception: 'error', status: Status.FAILED }
        this.eventBroadcaster.emit(
          'envelope',
          messages.Envelope.fromObject({
            testStepFinished: {
              testCaseStartedId: this.testCaseStartedId,
              testStepId: this.testStepId,
              testResult,
            },
          })
        )
        this.eventBroadcaster.emit(
          'envelope',
          messages.Envelope.fromObject({
            testCaseFinished: {
              testCaseStartedId: this.testCaseStartedId,
              testResult: { ...testResult, willBeRetried: true },
            },
          })
        )
      })

      it('prints a warning for the failed run', function() {
        expect(
          this.progressBarFormatter.progressBar.interrupt
        ).to.have.callCount(1)
      })

      describe('with passing run', function() {
        beforeEach(function() {
          this.progressBarFormatter.progressBar.interrupt.reset()
          const retriedTestCaseStartedId = uuidv4()
          this.eventBroadcaster.emit(
            'envelope',
            messages.Envelope.fromObject({
              testCaseStarted: {
                testCaseId: this.testCaseId,
                attempt: 1,
                id: retriedTestCaseStartedId,
              },
            })
          )
          const testResult = { status: Status.PASSED }
          this.eventBroadcaster.emit(
            'envelope',
            messages.Envelope.fromObject({
              testStepFinished: {
                testCaseStartedId: retriedTestCaseStartedId,
                testStepId: this.testStepId,
                testResult,
              },
            })
          )
          this.eventBroadcaster.emit(
            'envelope',
            messages.Envelope.fromObject({
              testCaseFinished: {
                testCaseStartedId: retriedTestCaseStartedId,
                testResult: testResult,
              },
            })
          )
        })

        it('does not print an additional error', function() {
          expect(
            this.progressBarFormatter.progressBar.interrupt
          ).to.have.callCount(0)
        })
      })

      describe('with all failures', function() {
        beforeEach(function() {
          this.progressBarFormatter.progressBar.interrupt.reset()
          const retriedTestCaseStartedId = uuidv4()
          this.eventBroadcaster.emit(
            'envelope',
            messages.Envelope.fromObject({
              testCaseStarted: {
                testCaseId: this.testCaseId,
                attempt: 1,
                id: retriedTestCaseStartedId,
              },
            })
          )
          const testResult = { exception: 'error', status: Status.FAILED }
          this.eventBroadcaster.emit(
            'envelope',
            messages.Envelope.fromObject({
              testStepFinished: {
                testCaseStartedId: retriedTestCaseStartedId,
                testStepId: this.testStepId,
                testResult,
              },
            })
          )
          this.eventBroadcaster.emit(
            'envelope',
            messages.Envelope.fromObject({
              testCaseFinished: {
                testCaseStartedId: retriedTestCaseStartedId,
                testResult: testResult,
              },
            })
          )
        })

        it('prints the error for the last run', function() {
          expect(
            this.progressBarFormatter.progressBar.interrupt
          ).to.have.callCount(1)
        })
      })
    })

    describe('passed', () => {
      beforeEach(function() {
        const testResult = { status: Status.PASSED }
        this.eventBroadcaster.emit(
          'envelope',
          messages.Envelope.fromObject({
            testStepFinished: {
              testCaseStartedId: this.testCaseStartedId,
              testStepId: this.testStepId,
              testResult,
            },
          })
        )
        this.eventBroadcaster.emit(
          'envelope',
          messages.Envelope.fromObject({
            testCaseFinished: {
              testCaseStartedId: this.testCaseStartedId,
              testResult: testResult,
            },
          })
        )
      })

      it('does not print anything', function() {
        expect(
          this.progressBarFormatter.progressBar.interrupt
        ).to.have.callCount(0)
      })
    })

    describe('pending', () => {
      beforeEach(function() {
        const testResult = { status: Status.PENDING }
        this.eventBroadcaster.emit(
          'envelope',
          messages.Envelope.fromObject({
            testStepFinished: {
              testCaseStartedId: this.testCaseStartedId,
              testStepId: this.testStepId,
              testResult,
            },
          })
        )
        this.eventBroadcaster.emit(
          'envelope',
          messages.Envelope.fromObject({
            testCaseFinished: {
              testCaseStartedId: this.testCaseStartedId,
              testResult: testResult,
            },
          })
        )
      })

      it('prints the warning', function() {
        expect(
          this.progressBarFormatter.progressBar.interrupt
        ).to.have.callCount(1)
      })
    })

    describe('skipped', () => {
      beforeEach(function() {
        const testResult = { status: Status.SKIPPED }
        this.eventBroadcaster.emit(
          'envelope',
          messages.Envelope.fromObject({
            testStepFinished: {
              testCaseStartedId: this.testCaseStartedId,
              testStepId: this.testStepId,
              testResult,
            },
          })
        )
        this.eventBroadcaster.emit(
          'envelope',
          messages.Envelope.fromObject({
            testCaseFinished: {
              testCaseStartedId: this.testCaseStartedId,
              testResult: testResult,
            },
          })
        )
      })

      it('does not print anything', function() {
        expect(
          this.progressBarFormatter.progressBar.interrupt
        ).to.have.callCount(0)
      })
    })

    describe('undefined', () => {
      beforeEach(function() {
        const testResult = { status: Status.UNDEFINED }
        this.eventBroadcaster.emit(
          'envelope',
          messages.Envelope.fromObject({
            testStepFinished: {
              testCaseStartedId: this.testCaseStartedId,
              testStepId: this.testStepId,
              testResult,
            },
          })
        )
        this.eventBroadcaster.emit(
          'envelope',
          messages.Envelope.fromObject({
            testCaseFinished: {
              testCaseStartedId: this.testCaseStartedId,
              testResult: testResult,
            },
          })
        )
      })

      it('prints the warning', function() {
        expect(
          this.progressBarFormatter.progressBar.interrupt
        ).to.have.callCount(1)
      })
    })
  })

  describe('test-run-finished', () => {
    beforeEach(function() {
      this.eventBroadcaster.emit(
        'envelope',
        messages.Envelope.fromObject({
          testRunFinished: {
            duration: 0,
          },
        })
      )
    })

    it('outputs step totals, scenario totals, and duration', function() {
      expect(this.output).to.contain(
        '0 scenarios\n' + '0 steps\n' + '0m00.000s\n'
      )
    })
  })
})
