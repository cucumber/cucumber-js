import { beforeEach, describe, it } from 'mocha'
import { expect } from 'chai'
import getColorFns from './get_color_fns'
import ProgressFormatter from './progress_formatter'
import Status from '../status'
import { EventEmitter } from 'events'
import { EventDataCollector } from './helpers'
import { messages } from 'cucumber-messages'
import uuidv4 from 'uuid/v4'

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
      const testCaseId = uuidv4()
      this.testStepId = uuidv4()
      this.testCaseStartedId = uuidv4()
      this.eventBroadcaster.emit(
        'envelope',
        new messages.Envelope({
          testCase: {
            id: testCaseId,
            steps: [
              {
                id: this.testStepId,
              },
            ],
          },
        })
      )
      this.eventBroadcaster.emit(
        'envelope',
        new messages.Envelope({
          testCaseStarted: {
            testCaseId,
            attempt: 0,
            id: this.testCaseStartedId,
          },
        })
      )
    })

    describe('ambiguous', () => {
      beforeEach(function() {
        this.eventBroadcaster.emit(
          'envelope',
          new messages.Envelope({
            testStepFinished: {
              testCaseStartedId: this.testCaseStartedId,
              testStepId: this.testStepId,
              testResult: { status: Status.AMBIGUOUS },
            },
          })
        )
      })

      it('outputs A', function() {
        expect(this.output).to.eql('A')
      })
    })

    describe('failed', () => {
      beforeEach(function() {
        this.eventBroadcaster.emit(
          'envelope',
          new messages.Envelope({
            testStepFinished: {
              testCaseStartedId: this.testCaseStartedId,
              testStepId: this.testStepId,
              testResult: { status: Status.FAILED },
            },
          })
        )
      })

      it('outputs F', function() {
        expect(this.output).to.eql('F')
      })
    })

    describe('passed', () => {
      beforeEach(function() {
        this.eventBroadcaster.emit(
          'envelope',
          new messages.Envelope({
            testStepFinished: {
              testCaseStartedId: this.testCaseStartedId,
              testStepId: this.testStepId,
              testResult: { status: Status.PASSED },
            },
          })
        )
      })

      it('outputs .', function() {
        expect(this.output).to.eql('.')
      })
    })

    describe('pending', () => {
      beforeEach(function() {
        this.eventBroadcaster.emit(
          'envelope',
          new messages.Envelope({
            testStepFinished: {
              testCaseStartedId: this.testCaseStartedId,
              testStepId: this.testStepId,
              testResult: { status: Status.PENDING },
            },
          })
        )
      })

      it('outputs P', function() {
        expect(this.output).to.eql('P')
      })
    })

    describe('skipped', () => {
      beforeEach(function() {
        this.eventBroadcaster.emit(
          'envelope',
          new messages.Envelope({
            testStepFinished: {
              testCaseStartedId: this.testCaseStartedId,
              testStepId: this.testStepId,
              testResult: { status: Status.SKIPPED },
            },
          })
        )
      })

      it('outputs -', function() {
        expect(this.output).to.eql('-')
      })
    })

    describe('undefined', () => {
      beforeEach(function() {
        this.eventBroadcaster.emit(
          'envelope',
          new messages.Envelope({
            testStepFinished: {
              testCaseStartedId: this.testCaseStartedId,
              testStepId: this.testStepId,
              testResult: { status: Status.UNDEFINED },
            },
          })
        )
      })

      it('outputs U', function() {
        expect(this.output).to.eql('U')
      })
    })
  })

  describe('test run finished', () => {
    beforeEach(function() {
      this.eventBroadcaster.emit(
        'envelope',
        new messages.Envelope({
          testRunFinished: {
            duration: 0,
          },
        })
      )
    })

    it('outputs two newlines before the summary', function() {
      expect(this.output).to.eql('\n\n0 scenarios\n0 steps\n0m00.000s\n')
    })
  })
})
