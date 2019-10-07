import { beforeEach, describe, it } from 'mocha'
import { expect } from 'chai'
import {
  createMock,
  parseGherkinDocument,
  emitTestCaseResults,
} from './test_helpers'
import getColorFns from './get_color_fns'
import Status from '../status'
import SummaryFormatter from './summary_formatter'
import figures from 'figures'
import { EventEmitter } from 'events'
import Gherkin from 'gherkin'
import { EventDataCollector } from './helpers'

describe('SummaryFormatter', () => {
  beforeEach(function() {
    this.output = ''
    const logFn = data => {
      this.output += data
    }
    this.eventBroadcaster = new EventEmitter()
    this.summaryFormatter = new SummaryFormatter({
      colorFns: getColorFns(false),
      eventBroadcaster: this.eventBroadcaster,
      eventDataCollector: new EventDataCollector(this.eventBroadcaster),
      log: logFn,
      snippetBuilder: createMock({ build: 'snippet' }),
    })
  })

  describe('issues', () => {
    beforeEach(function() {
      const events = Gherkin.generateEvents(
        'Feature: a\nScenario: b\nGiven a step',
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
      this.testCase = { sourceLocation: { uri: 'a.feature', line: 2 } }
    })

    describe('with a failing scenario', () => {
      beforeEach(function() {
        this.eventBroadcaster.emit('test-case-prepared', {
          sourceLocation: this.testCase.sourceLocation,
          steps: [
            {
              sourceLocation: { uri: 'a.feature', line: 3 },
              actionLocation: { uri: 'steps.js', line: 4 },
            },
          ],
        })
        this.eventBroadcaster.emit('test-step-finished', {
          index: 0,
          testCase: this.testCase,
          result: { exception: 'error', status: Status.FAILED },
        })
        this.eventBroadcaster.emit('test-case-finished', {
          sourceLocation: this.testCase.sourceLocation,
          result: { status: Status.FAILED },
        })
        this.eventBroadcaster.emit('test-run-finished', {
          result: { duration: 0 },
        })
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
        this.eventBroadcaster.emit('test-case-prepared', {
          sourceLocation: this.testCase.sourceLocation,
          steps: [
            {
              sourceLocation: { uri: 'a.feature', line: 3 },
            },
          ],
        })
        this.eventBroadcaster.emit('test-step-finished', {
          index: 0,
          testCase: this.testCase,
          result: {
            exception:
              'Multiple step definitions match:\n' +
              '  pattern1        - steps.js:3\n' +
              '  longer pattern2 - steps.js:4',
            status: Status.AMBIGUOUS,
          },
        })
        this.eventBroadcaster.emit('test-case-finished', {
          sourceLocation: this.testCase.sourceLocation,
          result: { status: Status.AMBIGUOUS },
        })
        this.eventBroadcaster.emit('test-run-finished', {
          result: { duration: 0 },
        })
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
        this.eventBroadcaster.emit('test-case-prepared', {
          sourceLocation: this.testCase.sourceLocation,
          steps: [
            {
              sourceLocation: { uri: 'a.feature', line: 3 },
            },
          ],
        })
        this.eventBroadcaster.emit('test-step-finished', {
          index: 0,
          testCase: this.testCase,
          result: { status: Status.UNDEFINED },
        })
        this.eventBroadcaster.emit('test-case-finished', {
          sourceLocation: this.testCase.sourceLocation,
          result: { status: Status.UNDEFINED },
        })
        this.eventBroadcaster.emit('test-run-finished', {
          result: { duration: 0 },
        })
      })

      it('logs the issue', function() {
        expect(this.output).to.eql(
          'Warnings:\n' +
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
        this.eventBroadcaster.emit('test-case-prepared', {
          sourceLocation: this.testCase.sourceLocation,
          steps: [
            {
              sourceLocation: { uri: 'a.feature', line: 3 },
              actionLocation: { uri: 'steps.js', line: 4 },
            },
          ],
        })
        this.eventBroadcaster.emit('test-step-finished', {
          index: 0,
          testCase: this.testCase,
          result: { status: Status.PENDING },
        })
        this.eventBroadcaster.emit('test-case-finished', {
          sourceLocation: this.testCase.sourceLocation,
          result: { status: Status.PENDING },
        })
        this.eventBroadcaster.emit('test-run-finished', {
          result: { duration: 0 },
        })
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

    describe('summary', () => {
      describe('with a duration of 123 milliseconds', () => {
        beforeEach(function() {
          this.eventBroadcaster.emit('test-run-finished', {
            result: { duration: 123 },
          })
        })

        it('outputs scenario totals, step totals, and duration', function() {
          expect(this.output).to.contain('0 scenarios\n0 steps\n0m00.123s\n')
        })
      })

      describe('with a duration of 12.3 seconds', () => {
        beforeEach(function() {
          this.eventBroadcaster.emit('test-run-finished', {
            result: { duration: 123 * 100 },
          })
        })

        it('outputs scenario totals, step totals, and duration', function() {
          expect(this.output).to.contain('0 scenarios\n0 steps\n0m12.300s\n')
        })
      })

      describe('with a duration of 120.3 seconds', () => {
        beforeEach(function() {
          this.eventBroadcaster.emit('test-run-finished', {
            result: { duration: 123 * 1000 },
          })
        })

        it('outputs scenario totals, step totals, and duration', function() {
          expect(this.output).to.contain('0 scenarios\n0 steps\n2m03.000s\n')
        })
      })
    })
  })

  describe('issues with localization (ru)', () => {
    beforeEach(function() {
      parseGherkinDocument({
        eventBroadcaster: this.eventBroadcaster,
        data: 'Функционал: a\nСценарий: b\nДано a step',
        uri: 'a.feature',
        language: 'ru',
      })
    })

    describe('with a failing scenario', () => {
      beforeEach(function() {
        emitTestCaseResults(this.eventBroadcaster, [
          {
            sourceLocation: { uri: 'a.feature', line: 2 },
            status: Status.FAILED,
            steps: [
              {
                sourceLocation: { uri: 'a.feature', line: 3 },
                actionLocation: { uri: 'steps.js', line: 4 },
                status: Status.FAILED,
                exception: 'error',
              },
            ],
          },
        ])
      })

      it('logs the issue', function() {
        expect(this.output).to.eql(
          'Failures:\n' +
            '\n' +
            '1) Сценарий: b # a.feature:2\n' +
            `   ${figures.cross} Дано a step # steps.js:4\n` +
            '       error\n' +
            '\n' +
            '1 scenario (1 failed)\n' +
            '1 step (1 failed)\n' +
            '0m00.000s\n'
        )
      })
    })
  })

  describe('scenario outline with issues with localization (ru)', () => {
    beforeEach(function() {
      parseGherkinDocument({
        eventBroadcaster: this.eventBroadcaster,
        data:
          '@tag1 @tag2\n' +
          'Функционал: обед\n' +
          'Описывает процесс обеда\n' +
          'Структура сценария: поедание огурцов\n' +
          'Описывает процесс поедания огурцов\n' +
          '  Дано <start> огурцов\n' +
          '  Если я съем <eat> огурцов\n' +
          '  Тогда у меня должно остаться <left> огурцов\n' +
          '  Примеры:\n' +
          '    | start | eat | left |\n' +
          '    |    12 |   5 |    7 |\n' +
          '    |    20 |   5 |   14 |',
        uri: 'a.feature',
        language: 'ru',
      })
    })

    describe('with a failing scenario', () => {
      beforeEach(function() {
        emitTestCaseResults(this.eventBroadcaster, [
          {
            sourceLocation: { uri: 'a.feature', line: 11 },
            status: Status.PASSED,
            steps: [
              {
                sourceLocation: { uri: 'a.feature', line: 6 },
                status: Status.PASSED,
              },
              {
                sourceLocation: { uri: 'a.feature', line: 7 },
                status: Status.PASSED,
              },
              {
                sourceLocation: { uri: 'a.feature', line: 8 },
                status: Status.PASSED,
              },
            ],
          },
          {
            sourceLocation: { uri: 'a.feature', line: 12 },
            status: Status.FAILED,
            steps: [
              {
                sourceLocation: { uri: 'a.feature', line: 6 },
                actionLocation: { uri: 'steps.js', line: 8 },
                status: Status.PASSED,
              },
              {
                sourceLocation: { uri: 'a.feature', line: 7 },
                actionLocation: { uri: 'steps.js', line: 12 },
                status: Status.PASSED,
              },
              {
                sourceLocation: { uri: 'a.feature', line: 8 },
                actionLocation: { uri: 'steps.js', line: 16 },
                status: Status.FAILED,
                exception: 'error',
              },
            ],
          },
        ])
      })

      it('logs the issue', function() {
        expect(this.output).to.eql(
          'Failures:\n' +
            '\n' +
            '1) Сценарий: поедание огурцов # a.feature:12\n' +
            `   ${figures.tick} Дано 20 огурцов # steps.js:8\n` +
            `   ${figures.tick} Если я съем 5 огурцов # steps.js:12\n` +
            `   ${figures.cross} Тогда у меня должно остаться 14 огурцов # steps.js:16\n` +
            '       error\n' +
            '\n' +
            '2 scenarios (1 failed, 1 passed)\n' +
            '6 steps (1 failed, 5 passed)\n' +
            '0m00.000s\n'
        )
      })
    })
  })
})
