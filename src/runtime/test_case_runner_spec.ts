import { EventEmitter } from 'node:events'
import {
  type Envelope,
  type GherkinDocument,
  IdGenerator,
  type Pickle,
  type TestStepResult,
  TestStepResultStatus,
  TimeConversion,
  type Timestamp,
} from '@cucumber/messages'
import FakeTimers, { type InstalledClock } from '@sinonjs/fake-timers'
import { expect } from 'chai'
import { afterEach, beforeEach, describe, it } from 'mocha'
import sinon from 'sinon'
import { getBaseSupportCodeLibrary } from '../../test/fixtures/steps'
import { parse } from '../../test/gherkin_helpers'
import { buildSupportCodeLibrary } from '../../test/runtime_helpers'
import { assembleTestCases } from '../assemble'
import FormatterBuilder from '../formatter/builder'
import type { SupportCodeLibrary } from '../support_code_library_builder/types'
import timeMethods from '../time'
import { valueOrDefault } from '../value_checker'
import TestCaseRunner from './test_case_runner'

async function testRunner(options: {
  workerId?: string
  gherkinDocument: GherkinDocument
  pickle: Pickle
  attempt?: number
  moreAttemptsRemaining?: boolean
  skip?: boolean
  supportCodeLibrary: SupportCodeLibrary
}): Promise<{
  envelopes: Envelope[]
  result: TestStepResultStatus
}> {
  const envelopes: Envelope[] = []
  const eventBroadcaster = new EventEmitter()
  const newId = IdGenerator.incrementing()
  const testCase = (
    await assembleTestCases(
      newId(),
      eventBroadcaster,
      newId,
      [
        {
          gherkinDocument: options.gherkinDocument,
          pickle: options.pickle,
        },
      ],
      options.supportCodeLibrary
    )
  )[0].testCase

  // listen for envelopers _after_ we've assembled test cases
  eventBroadcaster.on('envelope', (e) => envelopes.push(e))
  const snippetBuilder = await FormatterBuilder.getStepDefinitionSnippetBuilder({
    cwd: process.cwd(),
    supportCodeLibrary: options.supportCodeLibrary,
  })
  const runner = new TestCaseRunner({
    workerId: options.workerId,
    eventBroadcaster,
    gherkinDocument: options.gherkinDocument,
    newId,
    pickle: options.pickle,
    testCase,
    attempt: valueOrDefault(options.attempt, 0),
    moreAttemptsRemaining: valueOrDefault(options.moreAttemptsRemaining, false),
    filterStackTraces: false,
    skip: valueOrDefault(options.skip, false),
    supportCodeLibrary: options.supportCodeLibrary,
    worldParameters: {},
    snippetBuilder,
  })
  const result = await runner.run()
  return { envelopes, result }
}

function predictableTimestamp(counter: number): Timestamp {
  return {
    nanos: 1000000 * counter,
    seconds: 0,
  }
}

describe('TestCaseRunner', () => {
  let clock: InstalledClock

  beforeEach(() => {
    clock = FakeTimers.withGlobal(timeMethods).install()
  })

  afterEach(() => {
    clock.uninstall()
  })

  describe('run()', () => {
    describe('with a passing step', () => {
      it('emits testCase / testCaseStarted / testStepStarted / testStepFinished / testCaseFinished envelopes and returns the result', async () => {
        // Arrange
        const supportCodeLibrary = buildSupportCodeLibrary(({ Given }) => {
          Given('a step', () => {
            clock.tick(1)
          })
        })
        const {
          gherkinDocument,
          pickles: [pickle],
        } = await parse({
          data: ['Feature: a', 'Scenario: b', 'Given a step'].join('\n'),
          uri: 'a.feature',
        })
        const passedTestResult: TestStepResult = {
          duration: TimeConversion.millisecondsToDuration(1),
          status: TestStepResultStatus.PASSED,
        }

        // Act
        const { envelopes, result } = await testRunner({
          gherkinDocument,
          pickle,
          supportCodeLibrary,
        })

        // Assert
        const expectedEnvelopes: Envelope[] = [
          {
            testCaseStarted: {
              attempt: 0,
              id: '3',
              testCaseId: '1',
              timestamp: predictableTimestamp(0),
            },
          },
          {
            testStepStarted: {
              testCaseStartedId: '3',
              testStepId: '2',
              timestamp: predictableTimestamp(0),
            },
          },
          {
            testStepFinished: {
              testCaseStartedId: '3',
              testStepResult: passedTestResult,
              testStepId: '2',
              timestamp: predictableTimestamp(1),
            },
          },
          {
            testCaseFinished: {
              testCaseStartedId: '3',
              timestamp: predictableTimestamp(1),
              willBeRetried: false,
            },
          },
        ]
        expect(envelopes).to.eql(expectedEnvelopes)
        expect(result).to.eql(TestStepResultStatus.PASSED)
      })
    })

    describe('with a failing step', () => {
      it('emits and returns failing results', async () => {
        // Arrange
        const supportCodeLibrary = buildSupportCodeLibrary(({ Given }) => {
          Given('a step', () => {
            throw 'fail'
          })
        })
        const {
          gherkinDocument,
          pickles: [pickle],
        } = await parse({
          data: ['Feature: a', 'Scenario: b', 'Given a step'].join('\n'),
          uri: 'a.feature',
        })
        const failingTestResult: TestStepResult = {
          duration: TimeConversion.millisecondsToDuration(0),
          status: TestStepResultStatus.FAILED,
          message: 'Error: fail',
          exception: {
            type: 'Error',
            message: 'fail',
            stackTrace: 'Error: fail',
          },
        }

        // Act
        const { envelopes, result } = await testRunner({
          gherkinDocument,
          pickle,
          supportCodeLibrary,
        })

        // Assert
        expect(envelopes).to.have.lengthOf(4)
        expect(envelopes[2].testStepFinished.testStepResult).to.eql(failingTestResult)
        expect(result).to.eql(TestStepResultStatus.FAILED)
      })

      it('should provide the error to AfterStep and After hooks', async () => {
        // Arrange
        const error = new Error('fail')
        const afterStepStub = sinon.stub()
        const afterStub = sinon.stub()
        const supportCodeLibrary = buildSupportCodeLibrary(({ Given, AfterStep, After }) => {
          Given('a step', () => {
            throw error
          })
          AfterStep(afterStepStub)
          After(afterStub)
        })
        const {
          gherkinDocument,
          pickles: [pickle],
        } = await parse({
          data: ['Feature: a', 'Scenario: b', 'Given a step'].join('\n'),
          uri: 'a.feature',
        })

        // Act
        await testRunner({
          gherkinDocument,
          pickle,
          supportCodeLibrary,
        })

        // Assert
        expect(afterStepStub).to.have.been.calledOnce()
        expect(afterStepStub.lastCall.firstArg.error).to.eq(error)
        expect(afterStub).to.have.been.calledOnce()
        expect(afterStub.lastCall.firstArg.error).to.eq(error)
      })
    })

    describe('with an ambiguous step', () => {
      it('emits the expected envelopes and returns an ambiguous result', async () => {
        // Arrange
        const supportCodeLibrary = getBaseSupportCodeLibrary()
        const {
          gherkinDocument,
          pickles: [pickle],
        } = await parse({
          data: ['Feature: a', 'Scenario: b', 'Given an ambiguous step'].join('\n'),
          uri: 'a.feature',
        })

        // Act
        const { envelopes, result } = await testRunner({
          gherkinDocument,
          pickle,
          supportCodeLibrary,
        })

        // Assert
        expect(envelopes).to.have.lengthOf(4)
        const expected: TestStepResult = {
          status: TestStepResultStatus.AMBIGUOUS,
          duration: TimeConversion.millisecondsToDuration(0),
        }
        expect(envelopes[2].testStepFinished.testStepResult).to.eql(expected)
        expect(result).to.eql(envelopes[2].testStepFinished.testStepResult.status)
      })
    })

    describe('with a undefined step', () => {
      it('emits the expected envelopes and returns a undefined result', async () => {
        // Arrange
        const supportCodeLibrary = buildSupportCodeLibrary()
        const {
          gherkinDocument,
          pickles: [pickle],
        } = await parse({
          data: ['Feature: a', 'Scenario: b', 'Given a step'].join('\n'),
          uri: 'a.feature',
        })

        // Act
        const { envelopes, result } = await testRunner({
          gherkinDocument,
          pickle,
          supportCodeLibrary,
        })

        // Assert
        expect(envelopes).to.have.lengthOf(5)
        expect(envelopes[2].suggestion.snippets).to.have.lengthOf(1)
        expect(envelopes[3].testStepFinished.testStepResult).to.eql({
          status: TestStepResultStatus.UNDEFINED,
          duration: TimeConversion.millisecondsToDuration(0),
        })
        expect(result).to.eql(envelopes[3].testStepFinished.testStepResult.status)
      })
    })

    describe('with a failing step and more attempts remaining', () => {
      it('emits the expected envelopes and returns a failing result', async () => {
        // Arrange
        const supportCodeLibrary = buildSupportCodeLibrary(({ Given }) => {
          Given('a step', () => {
            clock.tick(1)
            throw 'Oh no!'
          })
        })
        const {
          gherkinDocument,
          pickles: [pickle],
        } = await parse({
          data: ['Feature: a', 'Scenario: b', 'Given a step'].join('\n'),
          uri: 'a.feature',
        })

        // Act
        const { envelopes, result } = await testRunner({
          gherkinDocument,
          pickle,
          attempt: 1,
          moreAttemptsRemaining: true,
          supportCodeLibrary,
        })

        // Assert
        const expected: Envelope[] = [
          {
            testCaseStarted: {
              attempt: 1,
              id: '3',
              testCaseId: '1',
              timestamp: predictableTimestamp(0),
            },
          },
          {
            testStepStarted: {
              testCaseStartedId: '3',
              testStepId: '2',
              timestamp: predictableTimestamp(0),
            },
          },
          {
            testStepFinished: {
              testCaseStartedId: '3',
              testStepResult: {
                duration: TimeConversion.millisecondsToDuration(1),
                message: 'Error: Oh no!',
                exception: {
                  type: 'Error',
                  message: 'Oh no!',
                  stackTrace: 'Error: Oh no!',
                },
                status: TestStepResultStatus.FAILED,
              },
              testStepId: '2',
              timestamp: predictableTimestamp(1),
            },
          },
          {
            testCaseFinished: {
              testCaseStartedId: '3',
              timestamp: predictableTimestamp(1),
              willBeRetried: true,
            },
          },
        ]
        expect(envelopes).to.eql(expected)
        expect(result).to.eql(TestStepResultStatus.FAILED)
      })

      it('provides willBeRetried as true to the After hook', async () => {
        // Arrange
        const hookStub = sinon.stub()
        const supportCodeLibrary = buildSupportCodeLibrary(({ Given, After }) => {
          Given('a step', () => {
            throw 'error'
          })
          After(hookStub)
        })
        const {
          gherkinDocument,
          pickles: [pickle],
        } = await parse({
          data: ['Feature: a', 'Scenario: b', 'Given a step'].join('\n'),
          uri: 'a.feature',
        })

        // Act
        await testRunner({
          gherkinDocument,
          pickle,
          moreAttemptsRemaining: true,
          supportCodeLibrary,
        })

        // Assert
        expect(hookStub).to.have.been.calledOnce()
        expect(hookStub.args[0][0].willBeRetried).to.eq(true)
      })
    })

    describe('with a failing step and no more attempts remaining', () => {
      it('provides willBeRetried as false to the After hook', async () => {
        // Arrange
        const hookStub = sinon.stub()
        const supportCodeLibrary = buildSupportCodeLibrary(({ Given, After }) => {
          Given('a step', () => {
            throw 'error'
          })
          After(hookStub)
        })
        const {
          gherkinDocument,
          pickles: [pickle],
        } = await parse({
          data: ['Feature: a', 'Scenario: b', 'Given a step'].join('\n'),
          uri: 'a.feature',
        })

        // Act
        await testRunner({
          gherkinDocument,
          pickle,
          moreAttemptsRemaining: false,
          supportCodeLibrary,
        })

        // Assert
        expect(hookStub).to.have.been.calledOnce()
        expect(hookStub.args[0][0].willBeRetried).to.eq(false)
      })
    })

    describe('with a step when skipping', () => {
      it('emits the expected envelopes and returns a skipped result', async () => {
        // Arrange
        const supportCodeLibrary = buildSupportCodeLibrary(({ Given }) => {
          Given('a step', () => {
            clock.tick(1)
          })
        })
        const {
          gherkinDocument,
          pickles: [pickle],
        } = await parse({
          data: ['Feature: a', 'Scenario: b', 'Given a step'].join('\n'),
          uri: 'a.feature',
        })

        // Act
        const { envelopes, result } = await testRunner({
          gherkinDocument,
          pickle,
          skip: true,
          supportCodeLibrary,
        })

        // Assert
        expect(envelopes).to.have.lengthOf(4)
        const expected: TestStepResult = {
          status: TestStepResultStatus.SKIPPED,
          duration: TimeConversion.millisecondsToDuration(0),
        }
        expect(envelopes[2].testStepFinished.testStepResult).to.eql(expected)
        expect(result).to.eql(envelopes[2].testStepFinished.testStepResult.status)
      })
    })

    describe('with test case hooks', () => {
      it('emits the expected envelopes and returns a skipped result', async () => {
        // Arrange
        const supportCodeLibrary = buildSupportCodeLibrary(({ Given, Before, After }) => {
          Given('a step', () => {
            clock.tick(1)
          })
          Before(() => {})
          After(() => {})
        })
        const {
          gherkinDocument,
          pickles: [pickle],
        } = await parse({
          data: ['Feature: a', 'Scenario: b', 'Given a step'].join('\n'),
          uri: 'a.feature',
        })

        // Act
        const { envelopes, result } = await testRunner({
          gherkinDocument,
          pickle,
          supportCodeLibrary,
        })

        // Assert
        expect(envelopes).to.have.lengthOf(8)
        expect(result).to.eql(envelopes[6].testStepFinished.testStepResult.status)
      })
    })

    describe('with step hooks', () => {
      it('emits the expected envelopes and returns a skipped result', async () => {
        const beforeStep = sinon.stub()
        const afterStep = sinon.stub()

        // Arrange
        const supportCodeLibrary = buildSupportCodeLibrary(({ Given, BeforeStep, AfterStep }) => {
          Given('a step', () => {
            clock.tick(1)
          })
          BeforeStep(beforeStep)
          AfterStep(afterStep)
        })
        const {
          gherkinDocument,
          pickles: [pickle],
        } = await parse({
          data: ['Feature: a', 'Scenario: b', 'Given a step'].join('\n'),
          uri: 'a.feature',
        })

        // Act
        const { envelopes, result } = await testRunner({
          gherkinDocument,
          pickle,
          supportCodeLibrary,
        })

        // Assert
        expect(envelopes).to.have.lengthOf(4)
        expect(result).to.eql(envelopes[2].testStepFinished.testStepResult.status)
        expect(beforeStep).to.have.been.calledOnceWith({
          gherkinDocument,
          pickle,
          pickleStep: pickle.steps[0],
          testCaseStartedId: envelopes[1].testStepStarted.testCaseStartedId,
          testStepId: envelopes[1].testStepStarted.testStepId,
          result: undefined,
          error: undefined,
        })
        expect(afterStep).to.have.been.calledOnceWith({
          gherkinDocument,
          pickle,
          pickleStep: pickle.steps[0],
          testCaseStartedId: envelopes[2].testStepFinished.testCaseStartedId,
          testStepId: envelopes[2].testStepFinished.testStepId,
          result: envelopes[2].testStepFinished.testStepResult,
          error: undefined,
        })
      })
    })

    it('emits workerId on testCaseStarted when provided', async () => {
      // Arrange
      const supportCodeLibrary = buildSupportCodeLibrary(({ Given }) => {
        Given('a step', () => {
          clock.tick(1)
        })
      })
      const {
        gherkinDocument,
        pickles: [pickle],
      } = await parse({
        data: ['Feature: a', 'Scenario: b', 'Given a step'].join('\n'),
        uri: 'a.feature',
      })

      // Act
      const { envelopes } = await testRunner({
        workerId: 'foo',
        gherkinDocument,
        pickle,
        supportCodeLibrary,
      })

      // Assert
      expect(envelopes).to.deep.include({
        testCaseStarted: {
          workerId: 'foo',
          attempt: 0,
          id: '3',
          testCaseId: '1',
          timestamp: predictableTimestamp(0),
        },
      })
    })
  })
})
