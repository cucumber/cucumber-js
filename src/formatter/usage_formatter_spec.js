import { beforeEach, describe, it } from 'mocha'
import { expect } from 'chai'
import UsageFormatter from './usage_formatter'
import EventEmitter from 'events'
import { generateEvents } from '../../test/gherkin_helpers'
import { EventDataCollector } from './helpers'
import {
  CucumberExpression,
  ParameterTypeRegistry,
  RegularExpression,
} from 'cucumber-expressions'
import { NANOSECONDS_IN_MILLISECOND, getZeroDuration, millisecondsToDuration } from '../time'
import { messages } from 'cucumber-messages'
import uuidv4 from 'uuid/v4'

describe('UsageFormatter', () => {
  describe('handleFeaturesResult', () => {
    beforeEach(function() {
      this.eventBroadcaster = new EventEmitter()
      this.parameterTypeRegistry = new ParameterTypeRegistry()
      this.output = ''
      const logFn = data => {
        this.output += data
      }
      this.supportCodeLibrary = {
        stepDefinitions: [],
      }
      this.usageFormatter = new UsageFormatter({
        cwd: '',
        eventBroadcaster: this.eventBroadcaster,
        eventDataCollector: new EventDataCollector(this.eventBroadcaster),
        log: logFn,
        supportCodeLibrary: this.supportCodeLibrary,
      })
    })

    describe('no step definitions', () => {
      beforeEach(function() {
        this.eventBroadcaster.emit(
          'envelope',
          messages.Envelope.fromObject({
            testRunFinished: {},
          })
        )
      })

      it('outputs "No step definitions"', function() {
        expect(this.output).to.eql('No step definitions')
      })
    })

    describe('with one step definition', () => {
      beforeEach(function() {
        this.stepDefinition = {
          id: uuidv4(),
          code: function() {},
          line: 1,
          expression: new RegularExpression(
            /^abc?$/,
            this.parameterTypeRegistry
          ),
          uri: 'steps.js',
        }
        this.supportCodeLibrary.stepDefinitions = [this.stepDefinition]
      })

      describe('unused', () => {
        beforeEach(function() {
          this.eventBroadcaster.emit(
            'envelope',
            messages.Envelope.fromObject({
              testRunFinished: {},
            })
          )
        })

        it('outputs the step definition as unused', function() {
          expect(this.output).to.eql(
            '┌────────────────┬──────────┬────────────┐\n' +
              '│ Pattern / Text │ Duration │ Location   │\n' +
              '├────────────────┼──────────┼────────────┤\n' +
              '│ /^abc?$/       │ UNUSED   │ steps.js:1 │\n' +
              '└────────────────┴──────────┴────────────┘\n'
          )
        })
      })

      describe('used', () => {
        beforeEach(async function() {
          const { pickle } = await generateEvents({
            data: 'Feature: a\nScenario: b\nWhen abc\nThen ab',
            eventBroadcaster: this.eventBroadcaster,
            uri: 'a.feature',
          })
          this.testCase = {
            pickleId: pickle.id,
            id: uuidv4(),
            testSteps: [
              {
                id: uuidv4(),
                pickleStepId: pickle.steps[0].id,
                stepDefinitionId: [this.stepDefinition.id],
              },
              {
                id: uuidv4(),
                pickleStepId: pickle.steps[1].id,
                stepDefinitionId: [this.stepDefinition.id],
              },
            ],
          }
          this.eventBroadcaster.emit(
            'envelope',
            messages.Envelope.fromObject({
              testCase: this.testCase,
            })
          )
          this.testCaseStartedId = uuidv4()
          this.eventBroadcaster.emit(
            'envelope',
            messages.Envelope.fromObject({
              testCaseStarted: {
                testCaseId: this.testCase.id,
                attempt: 0,
                id: this.testCaseStartedId,
              },
            })
          )
        })

        describe('in dry run', () => {
          beforeEach(function() {
            this.eventBroadcaster.emit(
              'envelope',
              messages.Envelope.fromObject({
                testStepFinished: {
                  testCaseStartedId: this.testCaseStartedId,
                  testStepId: this.testCase.testSteps[0].id,
                  testResult: { },
                },
              })
            )
            this.eventBroadcaster.emit(
              'envelope',
              messages.Envelope.fromObject({
                testStepFinished: {
                  testCaseStartedId: this.testCaseStartedId,
                  testStepId: this.testCase.testSteps[1].id,
                  testResult: { },
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

          it('outputs the step definition without durations', function() {
            expect(this.output).to.eql(
              '┌────────────────┬──────────┬─────────────┐\n' +
                '│ Pattern / Text │ Duration │ Location    │\n' +
                '├────────────────┼──────────┼─────────────┤\n' +
                '│ /^abc?$/       │ -        │ steps.js:1  │\n' +
                '│   ab           │ -        │ a.feature:4 │\n' +
                '│   abc          │ -        │ a.feature:3 │\n' +
                '└────────────────┴──────────┴─────────────┘\n'
            )
          })
        })

        describe('not in dry run', () => {
          beforeEach(function() {
            this.eventBroadcaster.emit(
              'envelope',
              messages.Envelope.fromObject({
                testStepFinished: {
                  testCaseStartedId: this.testCaseStartedId,
                  testStepId: this.testCase.testSteps[0].id,
                  testResult: { duration: millisecondsToDuration(2) },
                },
              })
            )
            this.eventBroadcaster.emit(
              'envelope',
              messages.Envelope.fromObject({
                testStepFinished: {
                  testCaseStartedId: this.testCaseStartedId,
                  testStepId: this.testCase.testSteps[1].id,
                  testResult: { duration: millisecondsToDuration(1) },
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

          it('outputs the step definition with durations in desending order', function() {
            expect(this.output).to.eql(
              '┌────────────────┬──────────┬─────────────┐\n' +
                '│ Pattern / Text │ Duration │ Location    │\n' +
                '├────────────────┼──────────┼─────────────┤\n' +
                '│ /^abc?$/       │ 1.50ms   │ steps.js:1  │\n' +
                '│   abc          │ 2ms      │ a.feature:3 │\n' +
                '│   ab           │ 1ms      │ a.feature:4 │\n' +
                '└────────────────┴──────────┴─────────────┘\n'
            )
          })
        })
      })
    })

    describe('with multiple definition', () => {
      beforeEach(async function() {
        this.supportCodeLibrary.stepDefinitions = [
          {
            id: uuidv4(),
            code: function(a) {},
            line: 1,
            expression: new RegularExpression(
              /abc/,
              this.parameterTypeRegistry
            ),
            uri: 'steps.js',
          },
          {
            id: uuidv4(),
            code: function(b) {},
            line: 2,
            expression: new CucumberExpression(
              'def',
              this.parameterTypeRegistry
            ),
            uri: 'steps.js',
          },
          {
            id: uuidv4(),
            code: function(c) {},
            line: 3,
            expression: new CucumberExpression(
              'ghi',
              this.parameterTypeRegistry
            ),
            uri: 'steps.js',
          },
        ]
        const { pickle } = await generateEvents({
          data: 'Feature: a\nScenario: b\nGiven abc\nWhen def',
          eventBroadcaster: this.eventBroadcaster,
          uri: 'a.feature',
        })
        const testCaseId = uuidv4()
        const testStepId1 = uuidv4()
        const testStepId2 = uuidv4()
        const testCaseStartedId = uuidv4()
        this.eventBroadcaster.emit(
          'envelope',
          messages.Envelope.fromObject({
            testCase: {
              pickleId: pickle.id,
              id: testCaseId,
              testSteps: [
                {
                  id: testStepId1,
                  pickleStepId: pickle.steps[0].id,
                  stepDefinitionId: [
                    this.supportCodeLibrary.stepDefinitions[0].id,
                  ],
                },
                {
                  id: testStepId2,
                  pickleStepId: pickle.steps[1].id,
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
              testStepId: testStepId1,
              testResult: { duration: millisecondsToDuration(1) },
            },
          })
        )
        this.eventBroadcaster.emit(
          'envelope',
          messages.Envelope.fromObject({
            testStepFinished: {
              testCaseStartedId,
              testStepId: testStepId2,
              testResult: { duration: millisecondsToDuration(2) },
            },
          })
        )
        this.eventBroadcaster.emit(
          'envelope',
          messages.Envelope.fromObject({
            testCaseFinished: {
              testCaseStartedId,
              testResult: {},
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

      it('outputs the step definitions ordered by mean duration descending with unused steps at the end', function() {
        expect(this.output).to.eql(
          '┌────────────────┬──────────┬─────────────┐\n' +
            '│ Pattern / Text │ Duration │ Location    │\n' +
            '├────────────────┼──────────┼─────────────┤\n' +
            '│ def            │ 2.00ms   │ steps.js:2  │\n' +
            '│   def          │ 2ms      │ a.feature:4 │\n' +
            '├────────────────┼──────────┼─────────────┤\n' +
            '│ /abc/          │ 1.00ms   │ steps.js:1  │\n' +
            '│   abc          │ 1ms      │ a.feature:3 │\n' +
            '├────────────────┼──────────┼─────────────┤\n' +
            '│ ghi            │ UNUSED   │ steps.js:3  │\n' +
            '└────────────────┴──────────┴─────────────┘\n'
        )
      })
    })
  })
})
