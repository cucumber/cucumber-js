import { beforeEach, describe, it } from 'mocha'
import { expect } from 'chai'
import { createMock } from './test_helpers'
import getColorFns from './get_color_fns'
import SummaryFormatter from './summary_formatter'
import figures from 'figures'
import { EventEmitter } from 'events'
import { generateEvents } from '../../test/gherkin_helpers'
import { EventDataCollector } from './helpers'
import { messages } from 'cucumber-messages'
import uuidv4 from 'uuid/v4'

const { Status } = messages.TestResult

describe('SummaryFormatter', () => {
  beforeEach(function() {
    this.output = ''
    const logFn = data => {
      this.output += data
    }
    this.eventBroadcaster = new EventEmitter()
    this.supportCodeLibrary = {
      stepDefinitions: [
        { id: uuidv4(), line: 3, uri: 'steps.js' },
        { id: uuidv4(), line: 4, uri: 'steps.js' },
      ],
    }
    this.summaryFormatter = new SummaryFormatter({
      colorFns: getColorFns(false),
      eventBroadcaster: this.eventBroadcaster,
      eventDataCollector: new EventDataCollector(this.eventBroadcaster),
      log: logFn,
      snippetBuilder: createMock({ build: 'snippet' }),
      supportCodeLibrary: this.supportCodeLibrary,
    })
  })

  describe('issues', () => {
    beforeEach(async function() {
      const { pickle } = await generateEvents({
        data: 'Feature: a\nScenario: b\nGiven a step',
        eventBroadcaster: this.eventBroadcaster,
        uri: 'a.feature',
      })
      this.pickle = pickle
    })

    describe('with a failing scenario', () => {
      beforeEach(function() {
        const testCaseId = uuidv4()
        const testStepId = uuidv4()
        const testCaseStartedId = uuidv4()
        const testResult = { message: 'error', status: Status.FAILED }
        this.eventBroadcaster.emit(
          'envelope',
          messages.Envelope.fromObject({
            testCase: {
              pickleId: this.pickle.id,
              id: testCaseId,
              testSteps: [
                {
                  id: testStepId,
                  pickleStepId: this.pickle.steps[0].id,
                  stepDefinitionId: [
                    this.supportCodeLibrary.stepDefinitions[1].id,
                  ],
                },
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
              id: testCaseStartedId,
            },
          })
        )
        this.eventBroadcaster.emit(
          'envelope',
          messages.Envelope.fromObject({
            testStepFinished: {
              testCaseStartedId,
              testStepId,
              testResult,
            },
          })
        )
        this.eventBroadcaster.emit(
          'envelope',
          messages.Envelope.fromObject({
            testCaseFinished: {
              testCaseStartedId,
              testResult,
            },
          })
        )
        this.eventBroadcaster.emit(
          'envelope',
          messages.Envelope.fromObject({
            testRunFinished: {},
          })
        )
      })

      it('logs the issue', function() {
        expect(this.output).to.eql(
          'Failures:\n' +
            '\n' +
            '1) Scenario: b # a.feature:2\n' +
            `   ${figures.cross} Given a step # steps.js:4\n` +
            '       error\n' +
            '\n' +
            '1 scenario (1 failed)\n' +
            '1 step (1 failed)\n' +
            '0m00.000s\n'
        )
      })
    })

    describe('with an ambiguous step', () => {
      beforeEach(function() {
        const testCaseId = uuidv4()
        const testStepId = uuidv4()
        const testCaseStartedId = uuidv4()
        const testResult = {
          message:
            'Multiple step definitions match:\n' +
            '  pattern1        - steps.js:3\n' +
            '  longer pattern2 - steps.js:4',
          status: Status.AMBIGUOUS,
        }
        this.eventBroadcaster.emit(
          'envelope',
          messages.Envelope.fromObject({
            testCase: {
              pickleId: this.pickle.id,
              id: testCaseId,
              testSteps: [
                {
                  id: testStepId,
                  pickleStepId: this.pickle.steps[0].id,
                  stepDefinitionId: [
                    this.supportCodeLibrary.stepDefinitions[0].id,
                    this.supportCodeLibrary.stepDefinitions[1].id,
                  ],
                },
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
              id: testCaseStartedId,
            },
          })
        )
        this.eventBroadcaster.emit(
          'envelope',
          messages.Envelope.fromObject({
            testStepFinished: {
              testCaseStartedId,
              testStepId,
              testResult,
            },
          })
        )
        this.eventBroadcaster.emit(
          'envelope',
          messages.Envelope.fromObject({
            testCaseFinished: {
              testCaseStartedId,
              testResult,
            },
          })
        )
        this.eventBroadcaster.emit(
          'envelope',
          messages.Envelope.fromObject({
            testRunFinished: {},
          })
        )
      })

      it('logs the issue', function() {
        expect(this.output).to.eql(
          'Failures:\n' +
            '\n' +
            '1) Scenario: b # a.feature:2\n' +
            `   ${figures.cross} Given a step\n` +
            '       Multiple step definitions match:\n' +
            '         pattern1        - steps.js:3\n' +
            '         longer pattern2 - steps.js:4\n' +
            '\n' +
            '1 scenario (1 ambiguous)\n' +
            '1 step (1 ambiguous)\n' +
            '0m00.000s\n'
        )
      })
    })

    describe('with an undefined step', () => {
      beforeEach(function() {
        const testCaseId = uuidv4()
        const testStepId = uuidv4()
        const testCaseStartedId = uuidv4()
        const testResult = { status: Status.UNDEFINED }
        this.eventBroadcaster.emit(
          'envelope',
          messages.Envelope.fromObject({
            testCase: {
              pickleId: this.pickle.id,
              id: testCaseId,
              testSteps: [
                {
                  id: testStepId,
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
              testCaseId,
              attempt: 0,
              id: testCaseStartedId,
            },
          })
        )
        this.eventBroadcaster.emit(
          'envelope',
          messages.Envelope.fromObject({
            testStepFinished: {
              testCaseStartedId,
              testStepId,
              testResult,
            },
          })
        )
        this.eventBroadcaster.emit(
          'envelope',
          messages.Envelope.fromObject({
            testCaseFinished: {
              testCaseStartedId,
              testResult,
            },
          })
        )
        this.eventBroadcaster.emit(
          'envelope',
          messages.Envelope.fromObject({
            testRunFinished: {},
          })
        )
      })

      it('logs the issue', function() {
        expect(this.output).to.eql(
          'Failures:\n' +
            '\n' +
            '1) Scenario: b # a.feature:2\n' +
            '   ? Given a step\n' +
            '       Undefined. Implement with the following snippet:\n' +
            '\n' +
            '         snippet\n' +
            '\n' +
            '\n' +
            '1 scenario (1 undefined)\n' +
            '1 step (1 undefined)\n' +
            '0m00.000s\n'
        )
      })
    })

    describe('with a pending step', () => {
      beforeEach(function() {
        const testCaseId = uuidv4()
        const testStepId = uuidv4()
        const testCaseStartedId = uuidv4()
        const testResult = { status: Status.PENDING }
        this.eventBroadcaster.emit(
          'envelope',
          messages.Envelope.fromObject({
            testCase: {
              pickleId: this.pickle.id,
              id: testCaseId,
              testSteps: [
                {
                  id: testStepId,
                  pickleStepId: this.pickle.steps[0].id,
                  stepDefinitionId: [
                    this.supportCodeLibrary.stepDefinitions[1].id,
                  ],
                },
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
              id: testCaseStartedId,
            },
          })
        )
        this.eventBroadcaster.emit(
          'envelope',
          messages.Envelope.fromObject({
            testStepFinished: {
              testCaseStartedId,
              testStepId,
              testResult,
            },
          })
        )
        this.eventBroadcaster.emit(
          'envelope',
          messages.Envelope.fromObject({
            testCaseFinished: {
              testCaseStartedId,
              testResult,
            },
          })
        )
        this.eventBroadcaster.emit(
          'envelope',
          messages.Envelope.fromObject({
            testRunFinished: {},
          })
        )
      })

      it('logs the issue', function() {
        expect(this.output).to.eql(
          'Warnings:\n' +
            '\n' +
            '1) Scenario: b # a.feature:2\n' +
            '   ? Given a step # steps.js:4\n' +
            '       Pending\n' +
            '\n' +
            '1 scenario (1 pending)\n' +
            '1 step (1 pending)\n' +
            '0m00.000s\n'
        )
      })
    })

    describe('with a passing flaky step', () => {
      beforeEach(function() {
        const testCaseId = uuidv4()
        const testStepId = uuidv4()
        const testCaseStartedId1 = uuidv4()
        const testCaseStartedId2 = uuidv4()
        const failingTestResult = { message: 'error', status: Status.FAILED }
        const passingTestResult = { status: Status.PASSED }
        this.eventBroadcaster.emit(
          'envelope',
          messages.Envelope.fromObject({
            testCase: {
              pickleId: this.pickle.id,
              id: testCaseId,
              testSteps: [
                {
                  id: testStepId,
                  pickleStepId: this.pickle.steps[0].id,
                  stepDefinitionId: [
                    this.supportCodeLibrary.stepDefinitions[1].id,
                  ],
                },
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
              id: testCaseStartedId1,
            },
          })
        )
        this.eventBroadcaster.emit(
          'envelope',
          messages.Envelope.fromObject({
            testStepFinished: {
              testCaseStartedId: testCaseStartedId1,
              testStepId,
              testResult: failingTestResult,
            },
          })
        )
        this.eventBroadcaster.emit(
          'envelope',
          messages.Envelope.fromObject({
            testCaseFinished: {
              testCaseStartedId: testCaseStartedId1,
              testResult: { ...failingTestResult, willBeRetried: true },
            },
          })
        )
        this.eventBroadcaster.emit(
          'envelope',
          messages.Envelope.fromObject({
            testCaseStarted: {
              testCaseId,
              attempt: 1,
              id: testCaseStartedId2,
            },
          })
        )
        this.eventBroadcaster.emit(
          'envelope',
          messages.Envelope.fromObject({
            testStepFinished: {
              testCaseStartedId: testCaseStartedId2,
              testStepId,
              testResult: passingTestResult,
            },
          })
        )
        this.eventBroadcaster.emit(
          'envelope',
          messages.Envelope.fromObject({
            testCaseFinished: {
              testCaseStartedId: testCaseStartedId2,
              testResult: passingTestResult,
            },
          })
        )
        this.eventBroadcaster.emit(
          'envelope',
          messages.Envelope.fromObject({
            testRunFinished: {},
          })
        )
      })

      it('logs the issue', function() {
        expect(this.output).to.eql(
          'Warnings:\n' +
            '\n' +
            '1) Scenario: b (attempt 1, retried) # a.feature:2\n' +
            `   ${figures.cross} Given a step # steps.js:4\n` +
            '       error\n' +
            '\n' +
            '1 scenario (1 passed)\n' +
            '1 step (1 passed)\n' +
            '0m00.000s\n'
        )
      })
    })

    describe('with a failed flaky step', () => {
      beforeEach(function() {
        const testCaseId = uuidv4()
        const testStepId = uuidv4()
        const testCaseStartedId1 = uuidv4()
        const testCaseStartedId2 = uuidv4()
        const failingTestResult = { message: 'error', status: Status.FAILED }
        this.eventBroadcaster.emit(
          'envelope',
          messages.Envelope.fromObject({
            testCase: {
              pickleId: this.pickle.id,
              id: testCaseId,
              testSteps: [
                {
                  id: testStepId,
                  pickleStepId: this.pickle.steps[0].id,
                  stepDefinitionId: [
                    this.supportCodeLibrary.stepDefinitions[1].id,
                  ],
                },
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
              id: testCaseStartedId1,
            },
          })
        )
        this.eventBroadcaster.emit(
          'envelope',
          messages.Envelope.fromObject({
            testStepFinished: {
              testCaseStartedId: testCaseStartedId1,
              testStepId,
              testResult: failingTestResult,
            },
          })
        )
        this.eventBroadcaster.emit(
          'envelope',
          messages.Envelope.fromObject({
            testCaseFinished: {
              testCaseStartedId: testCaseStartedId1,
              testResult: { ...failingTestResult, willBeRetried: true },
            },
          })
        )
        this.eventBroadcaster.emit(
          'envelope',
          messages.Envelope.fromObject({
            testCaseStarted: {
              testCaseId,
              attempt: 1,
              id: testCaseStartedId2,
            },
          })
        )
        this.eventBroadcaster.emit(
          'envelope',
          messages.Envelope.fromObject({
            testStepFinished: {
              testCaseStartedId: testCaseStartedId2,
              testStepId,
              testResult: failingTestResult,
            },
          })
        )
        this.eventBroadcaster.emit(
          'envelope',
          messages.Envelope.fromObject({
            testCaseFinished: {
              testCaseStartedId: testCaseStartedId2,
              testResult: failingTestResult,
            },
          })
        )
        this.eventBroadcaster.emit(
          'envelope',
          messages.Envelope.fromObject({
            testRunFinished: {},
          })
        )
      })

      it('logs the issue', function() {
        expect(this.output).to.eql(
          'Failures:\n' +
            '\n' +
            '1) Scenario: b (attempt 2) # a.feature:2\n' +
            `   ${figures.cross} Given a step # steps.js:4\n` +
            '       error\n' +
            '\n' +
            'Warnings:\n' +
            '\n' +
            '1) Scenario: b (attempt 1, retried) # a.feature:2\n' +
            `   ${figures.cross} Given a step # steps.js:4\n` +
            '       error\n' +
            '\n' +
            '1 scenario (1 failed)\n' +
            '1 step (1 failed)\n' +
            '0m00.000s\n'
        )
      })
    })
  })
})
