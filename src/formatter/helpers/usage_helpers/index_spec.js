import { beforeEach, describe, it } from 'mocha'
import { expect } from 'chai'
import { getUsage } from './'
import EventEmitter from 'events'
import { generateEvents } from '../../../../test/gherkin_helpers'
import EventDataCollector from '../event_data_collector'
import { CucumberExpression, ParameterTypeRegistry } from 'cucumber-expressions'
import { messages } from 'cucumber-messages'
import uuidv4 from 'uuid/v4'
import { getZeroDuration } from '../../../time'

const { Status } = messages.TestResult

describe('Usage Helpers', () => {
  describe('getUsage', () => {
    beforeEach(function() {
      this.eventBroadcaster = new EventEmitter()
      this.eventDataCollector = new EventDataCollector(this.eventBroadcaster)
      this.parameterTypeRegistry = new ParameterTypeRegistry()
      this.stepDefinitions = []
      this.getResult = () =>
        getUsage({
          eventDataCollector: this.eventDataCollector,
          stepDefinitions: this.stepDefinitions,
        })
    })

    describe('no step definitions', () => {
      describe('without steps', () => {
        beforeEach(function() {
          this.eventBroadcaster.emit(
            'envelope',
            messages.Envelope.fromObject({
              testRunFinished: {},
            })
          )
        })

        it('returns an empty array', function() {
          expect(this.getResult()).to.eql([])
        })
      })

      describe('with some steps', () => {
        beforeEach(async function() {
          const {
            pickles: [pickle],
          } = await generateEvents({
            data: 'Feature: a\nScenario: b\nWhen abc\nThen ab',
            eventBroadcaster: this.eventBroadcaster,
            uri: 'a.feature',
          })
          const testCaseId = uuidv4()
          const testStepId = uuidv4()
          const testCaseStartedId = uuidv4()
          const testResult = messages.TestResult.fromObject({
            duration: getZeroDuration(),
            status: Status.UNDEFINED,
          })
          this.eventBroadcaster.emit(
            'envelope',
            messages.Envelope.fromObject({
              testCase: {
                pickleId: pickle.id,
                id: testCaseId,
                testSteps: [
                  {
                    id: testStepId,
                    pickleStepId: pickle.steps[0].id,
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

        it('returns an empty array', function() {
          expect(this.getResult()).to.eql([])
        })
      })
    })

    describe('with step definitions', () => {
      beforeEach(function() {
        this.stepDefinitions.push(
          {
            id: uuidv4(),
            code: function() {'original code'}, // eslint-disable-line prettier/prettier
            uri: 'steps.js',
            expression: new CucumberExpression(
              'abc',
              this.parameterTypeRegistry
            ),
            line: 30,
          },
          {
            id: uuidv4(),
            code: function() {'wrapped code'}, // eslint-disable-line prettier/prettier
            unwrappedCode: function() {'original code'}, // eslint-disable-line prettier/prettier
            uri: 'steps.js',
            expression: new CucumberExpression(
              'ab',
              this.parameterTypeRegistry
            ),
            line: 40,
          }
        )
      })

      describe('without steps run', () => {
        beforeEach(function() {
          this.eventBroadcaster.emit(
            'envelope',
            messages.Envelope.fromObject({
              testRunFinished: {},
            })
          )
        })

        it('returns an array with the step definitions, including correct stringified code', function() {
          const result = this.getResult()
          expect(result).to.have.lengthOf(2)
          expect(result[0].code).to.contain('original code')
          expect(result[1].code).to.contain('original code')
        })
      })

      describe('with some steps', () => {
        beforeEach(async function() {
          const {
            pickles: [pickle],
          } = await generateEvents({
            data: 'Feature: a\nScenario: b\nWhen abc\nThen ab',
            eventBroadcaster: this.eventBroadcaster,
            uri: 'a.feature',
          })
          const testCaseId = uuidv4()
          const testStepId = uuidv4()
          const testCaseStartedId = uuidv4()
          const testResult = messages.TestResult.fromObject({
            duration: getZeroDuration(),
            status: Status.UNDEFINED,
          })
          this.eventBroadcaster.emit(
            'envelope',
            messages.Envelope.fromObject({
              testCase: {
                pickleId: pickle.id,
                id: testCaseId,
                steps: [
                  {
                    id: testStepId,
                    pickleStepId: pickle.steps[0].id,
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

        it('returns an array with the step definitions, including correct stringified code', function() {
          const result = this.getResult()
          expect(result).to.have.lengthOf(2)
          expect(result[0].code).to.contain('original code')
          expect(result[1].code).to.contain('original code')
        })
      })
    })
  })
})
