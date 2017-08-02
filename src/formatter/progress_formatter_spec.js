import getColorFns from './get_color_fns'
import ProgressFormatter from './progress_formatter'
import Status from '../status'
import { EventEmitter } from 'events'
import { EventDataCollector } from './helpers'

describe('ProgressFormatter', function() {
  beforeEach(function() {
    this.eventBroadcaster = new EventEmitter()
    this.output = ''
    const colorFns = getColorFns(false)
    const logFn = data => {
      this.output += data
    }
    this.progressFormatter = new ProgressFormatter({
      colorFns,
      eventBroadcaster: this.eventBroadcaster,
      eventDataCollector: new EventDataCollector(this.eventBroadcaster),
      log: logFn
    })
  })

  describe('test step finished', function() {
    beforeEach(function() {
      this.testCase = { sourceLocation: { uri: 'path/to/feature', line: 1 } }
      this.eventBroadcaster.emit('test-case-prepared', {
        sourceLocation: this.testCase.sourceLocation,
        steps: [{}]
      })
    })

    describe('ambiguous', function() {
      beforeEach(function() {
        this.eventBroadcaster.emit('test-step-finished', {
          index: 0,
          result: { status: Status.AMBIGUOUS },
          testCase: this.testCase
        })
      })

      it('outputs A', function() {
        expect(this.output).to.eql('A')
      })
    })

    describe('failed', function() {
      beforeEach(function() {
        this.eventBroadcaster.emit('test-step-finished', {
          index: 0,
          result: { status: Status.FAILED },
          testCase: this.testCase
        })
      })

      it('outputs F', function() {
        expect(this.output).to.eql('F')
      })
    })

    describe('passed', function() {
      beforeEach(function() {
        this.eventBroadcaster.emit('test-step-finished', {
          index: 0,
          result: { status: Status.PASSED },
          testCase: this.testCase
        })
      })

      it('outputs .', function() {
        expect(this.output).to.eql('.')
      })
    })

    describe('pending', function() {
      beforeEach(function() {
        this.eventBroadcaster.emit('test-step-finished', {
          index: 0,
          result: { status: Status.PENDING },
          testCase: this.testCase
        })
      })

      it('outputs P', function() {
        expect(this.output).to.eql('P')
      })
    })

    describe('skipped', function() {
      beforeEach(function() {
        this.eventBroadcaster.emit('test-step-finished', {
          index: 0,
          result: { status: Status.SKIPPED },
          testCase: this.testCase
        })
      })

      it('outputs -', function() {
        expect(this.output).to.eql('-')
      })
    })

    describe('undefined', function() {
      beforeEach(function() {
        this.eventBroadcaster.emit('test-step-finished', {
          index: 0,
          result: { status: Status.UNDEFINED },
          testCase: this.testCase
        })
      })

      it('outputs U', function() {
        expect(this.output).to.eql('U')
      })
    })
  })

  describe('test run finished', function() {
    beforeEach(function() {
      this.eventBroadcaster.emit('test-run-finished', {
        result: { duration: 0 }
      })
    })

    it('outputs two newlines before the summary', function() {
      expect(this.output).to.eql('\n\n0 scenarios\n0 steps\n0m00.000s\n')
    })
  })
})
