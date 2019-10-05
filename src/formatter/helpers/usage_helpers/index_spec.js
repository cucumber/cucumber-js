import { beforeEach, describe, it } from 'mocha'
import { expect } from 'chai'
import { getUsage } from './'
import EventEmitter from 'events'
import Gherkin from 'gherkin'
import EventDataCollector from '../event_data_collector'
import { CucumberExpression, ParameterTypeRegistry } from 'cucumber-expressions'

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
          this.eventBroadcaster.emit('test-run-finished')
        })

        it('returns an empty array', function() {
          expect(this.getResult()).to.eql([])
        })
      })

      describe('with some steps', () => {
        beforeEach(function() {
          const events = Gherkin.generateEvents(
            'Feature: a\nScenario: b\nWhen abc\nThen ab',
            'a.feature'
          )
          events.forEach(event => {
            this.eventBroadcaster.emit(event.type, event)
            if (event.type === 'pickle') {
              this.eventBroadcaster.emit('pickle-accepted', {
                type: 'pickle-accepted',
                pickle: event.pickle,
                uri: event.uri,
              })
            }
          })
          const testCase = {
            attemptNumber: 1,
            sourceLocation: { uri: 'a.feature', line: 2 },
          }
          this.eventBroadcaster.emit('test-case-prepared', {
            sourceLocation: testCase.sourceLocation,
            steps: [
              { sourceLocation: { uri: 'a.feature', line: 3 } },
              { sourceLocation: { uri: 'a.feature', line: 4 } },
            ],
          })
          this.eventBroadcaster.emit('test-case-started', testCase)
          this.eventBroadcaster.emit('test-step-finished', {
            index: 0,
            testCase,
            result: {},
          })
          this.eventBroadcaster.emit('test-step-finished', {
            index: 1,
            testCase,
            result: {},
          })
          this.eventBroadcaster.emit('test-case-finished', {
            ...testCase,
            result: {},
          })
          this.eventBroadcaster.emit('test-run-finished')
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
            code: function() {'original code'}, // eslint-disable-line prettier/prettier
            uri: 'steps.js',
            expression: new CucumberExpression(
              'abc',
              this.parameterTypeRegistry
            ),
            line: 30,
          },
          {
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
          this.eventBroadcaster.emit('test-run-finished')
        })

        it('returns an array with the step definitions', function() {
          expect(this.getResult()).to.have.lengthOf(2)
        })
      })

      describe('with some steps', () => {
        beforeEach(function() {
          const events = Gherkin.generateEvents(
            'Feature: a\nScenario: b\nWhen abc\nThen ab',
            'a.feature'
          )
          events.forEach(event => {
            this.eventBroadcaster.emit(event.type, event)
            if (event.type === 'pickle') {
              this.eventBroadcaster.emit('pickle-accepted', {
                type: 'pickle-accepted',
                pickle: event.pickle,
                uri: event.uri,
              })
            }
          })
          const testCase = {
            attemptNumber: 1,
            sourceLocation: { uri: 'a.feature', line: 2 },
          }
          this.eventBroadcaster.emit('test-case-prepared', {
            sourceLocation: testCase.sourceLocation,
            steps: [
              { sourceLocation: { uri: 'a.feature', line: 3 } },
              { sourceLocation: { uri: 'a.feature', line: 4 } },
            ],
          })
          this.eventBroadcaster.emit('test-case-started', testCase)
          this.eventBroadcaster.emit('test-step-finished', {
            index: 0,
            testCase,
            result: {},
          })
          this.eventBroadcaster.emit('test-step-finished', {
            index: 1,
            testCase,
            result: {},
          })
          this.eventBroadcaster.emit('test-run-finished')
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
