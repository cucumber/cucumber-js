import { beforeEach, describe, it } from 'mocha'
import { expect } from 'chai'
import UsageJsonFormatter from './usage_json_formatter'
import EventEmitter from 'events'
import { generateEvents } from '../../test/gherkin_helpers'
import { EventDataCollector } from './helpers'
import {
  CucumberExpression,
  ParameterTypeRegistry,
  RegularExpression,
} from 'cucumber-expressions'
import { messages } from 'cucumber-messages'
import uuidv4 from 'uuid/v4'
import { millisecondsToDuration } from '../time'

describe('UsageJsonFormatter', () => {
  describe('handleFeaturesResult', () => {
    beforeEach(async function() {
      const eventBroadcaster = new EventEmitter()
      const parameterTypeRegistry = new ParameterTypeRegistry()
      this.output = ''
      const logFn = data => {
        this.output += data
      }
      const supportCodeLibrary = {
        stepDefinitions: [
          {
            id: uuidv4(),
            code: function(a) {},
            line: 1,
            expression: new CucumberExpression('abc', parameterTypeRegistry),
            uri: 'steps.js',
          },
          {
            id: uuidv4(),
            code: function(b) {},
            line: 2,
            expression: new RegularExpression(/def/, parameterTypeRegistry),
            uri: 'steps.js',
          },
          {
            id: uuidv4(),
            code: function(c) {},
            line: 3,
            expression: new CucumberExpression('ghi', parameterTypeRegistry),
            uri: 'steps.js',
          },
        ],
      }
      this.usageJsonFormatter = new UsageJsonFormatter({
        cwd: '',
        eventBroadcaster,
        eventDataCollector: new EventDataCollector(eventBroadcaster),
        log: logFn,
        supportCodeLibrary,
      })
      const { pickle } = await generateEvents({
        data: 'Feature: a\nScenario: b\nGiven abc\nWhen def',
        eventBroadcaster,
        uri: 'a.feature',
      })
      const testCaseId = uuidv4()
      const testStepId1 = uuidv4()
      const testStepId2 = uuidv4()
      const testCaseStartedId = uuidv4()
      eventBroadcaster.emit(
        'envelope',
        messages.Envelope.fromObject({
          testCase: {
            pickleId: pickle.id,
            id: testCaseId,
            testSteps: [
              {
                id: testStepId1,
                pickleStepId: pickle.steps[0].id,
                stepDefinitionId: [supportCodeLibrary.stepDefinitions[0].id],
              },
              {
                id: testStepId2,
                pickleStepId: pickle.steps[1].id,
                stepDefinitionId: [supportCodeLibrary.stepDefinitions[1].id],
              },
            ],
          },
        })
      )
      eventBroadcaster.emit(
        'envelope',
        new messages.Envelope({
          testCaseStarted: {
            testCaseId,
            attempt: 0,
            id: testCaseStartedId,
          },
        })
      )
      eventBroadcaster.emit(
        'envelope',
        messages.Envelope.fromObject({
          testStepFinished: {
            testCaseStartedId,
            testStepId: testStepId1,
            testResult: { duration: millisecondsToDuration(1) }
          },
        })
      )
      eventBroadcaster.emit(
        'envelope',
        messages.Envelope.fromObject({
          testStepFinished: {
            testCaseStartedId,
            testStepId: testStepId2,
            testResult: { duration: millisecondsToDuration(2) },
          },
        })
      )
      eventBroadcaster.emit(
        'envelope',
        messages.Envelope.fromObject({
          testCaseFinished: {
            testCaseStartedId,
            testResult: {},
          },
        })
      )
      eventBroadcaster.emit(
        'envelope',
        messages.Envelope.fromObject({
          testRunFinished: {},
        })
      )
    })

    it('outputs the usage in json format', function() {
      const parsedOutput = JSON.parse(this.output)
      expect(parsedOutput).to.eql([
        {
          code: 'function (b) {}',
          line: 2,
          matches: [
            {
              duration: {
                seconds: 0,
                nanos: 2000000,
              },
              line: 4,
              text: 'def',
              uri: 'a.feature',
            },
          ],
          meanDuration: {
            seconds: 0,
            nanos: 2000000,
          },
          pattern: 'def',
          patternType: 'RegularExpression',
          uri: 'steps.js',
        },
        {
          code: 'function (a) {}',
          line: 1,
          matches: [
            {
              duration: {
                seconds: 0,
                nanos: 1000000,
              },
              line: 3,
              text: 'abc',
              uri: 'a.feature',
            },
          ],
          meanDuration: {
            seconds: 0,
            nanos: 1000000,
          },
          pattern: 'abc',
          patternType: 'CucumberExpression',
          uri: 'steps.js',
        },
        {
          code: 'function (c) {}',
          line: 3,
          matches: [],
          pattern: 'ghi',
          patternType: 'CucumberExpression',
          uri: 'steps.js',
        },
      ])
    })
  })
})
