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
            code: function(a) {},
            line: 1,
            expression: new CucumberExpression('abc', parameterTypeRegistry),
            uri: 'steps.js',
          },
          {
            code: function(b) {},
            line: 2,
            expression: new RegularExpression(/def/, parameterTypeRegistry),
            uri: 'steps.js',
          },
          {
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
      await generateEvents({
        data: 'Feature: a\nScenario: b\nGiven abc\nWhen def',
        eventBroadcaster,
        uri: 'a.feature',
      })
      const testCase = { sourceLocation: { uri: 'a.feature', line: 2 } }
      eventBroadcaster.emit('test-case-prepared', {
        ...testCase,
        steps: [
          {
            sourceLocation: { uri: 'a.feature', line: 3 },
            actionLocation: { uri: 'steps.js', line: 1 },
          },
          {
            sourceLocation: { uri: 'a.feature', line: 4 },
            actionLocation: { uri: 'steps.js', line: 2 },
          },
        ],
      })
      eventBroadcaster.emit('test-step-finished', {
        index: 0,
        testCase,
        result: { duration: 1 },
      })
      eventBroadcaster.emit('test-step-finished', {
        index: 1,
        testCase,
        result: { duration: 2 },
      })
      eventBroadcaster.emit('test-run-finished')
    })

    it('outputs the usage in json format', function() {
      const parsedOutput = JSON.parse(this.output)
      expect(parsedOutput).to.eql([
        {
          code: 'function (b) {}',
          line: 2,
          matches: [
            {
              duration: 2,
              line: 4,
              text: 'def',
              uri: 'a.feature',
            },
          ],
          meanDuration: 2,
          pattern: 'def',
          patternType: 'RegularExpression',
          uri: 'steps.js',
        },
        {
          code: 'function (a) {}',
          line: 1,
          matches: [
            {
              duration: 1,
              line: 3,
              text: 'abc',
              uri: 'a.feature',
            },
          ],
          meanDuration: 1,
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
