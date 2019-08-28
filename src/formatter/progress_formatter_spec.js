import { beforeEach, describe, it } from 'mocha'
import { expect } from 'chai'
import getColorFns from './get_color_fns'
import ProgressFormatter from './progress_formatter'
import Status from '../status'
import { EventEmitter } from 'events'
import { EventDataCollector } from './helpers'

describe('ProgressFormatter', () => {
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
      log: logFn,
    })
  })

  describe('test step finished', () => {
    beforeEach(function() {
      this.testCase = {
        attemptNumber: 1,
        sourceLocation: { uri: 'path/to/feature', line: 1 },
      }
      this.eventBroadcaster.emit('test-case-prepared', {
        ...this.testCase,
        steps: [{}],
      })
      this.eventBroadcaster.emit('test-case-started', this.testCase)
    })

    describe('ambiguous', () => {
      beforeEach(function() {
        this.eventBroadcaster.emit('test-step-finished', {
          index: 0,
          result: { status: Status.AMBIGUOUS },
          testCase: this.testCase,
        })
      })

      it('outputs A', function() {
        expect(this.output).to.eql('A')
      })
    })

    describe('failed', () => {
      beforeEach(function() {
        this.eventBroadcaster.emit('test-step-finished', {
          index: 0,
          result: { status: Status.FAILED },
          testCase: this.testCase,
        })
      })

      it('outputs F', function() {
        expect(this.output).to.eql('F')
      })
    })

    describe('passed', () => {
      beforeEach(function() {
        this.eventBroadcaster.emit('test-step-finished', {
          index: 0,
          result: { status: Status.PASSED },
          testCase: this.testCase,
        })
      })

      it('outputs .', function() {
        expect(this.output).to.eql('.')
      })
    })

    describe('pending', () => {
      beforeEach(function() {
        this.eventBroadcaster.emit('test-step-finished', {
          index: 0,
          result: { status: Status.PENDING },
          testCase: this.testCase,
        })
      })

      it('outputs P', function() {
        expect(this.output).to.eql('P')
      })
    })

    describe('skipped', () => {
      beforeEach(function() {
        this.eventBroadcaster.emit('test-step-finished', {
          index: 0,
          result: { status: Status.SKIPPED },
          testCase: this.testCase,
        })
      })

      it('outputs -', function() {
        expect(this.output).to.eql('-')
      })
    })

    describe('undefined', () => {
      beforeEach(function() {
        this.eventBroadcaster.emit('test-step-finished', {
          index: 0,
          result: { status: Status.UNDEFINED },
          testCase: this.testCase,
        })
      })

      it('outputs U', function() {
        expect(this.output).to.eql('U')
      })
    })
  })

  describe('test run finished', () => {
    beforeEach(function() {
      this.eventBroadcaster.emit('test-run-finished', {
        result: { duration: 0 },
      })
    })

    it('outputs two newlines before the summary', function() {
      expect(this.output).to.eql('\n\n0 scenarios\n0 steps\n0m00.000s\n')
    })
  })
})
