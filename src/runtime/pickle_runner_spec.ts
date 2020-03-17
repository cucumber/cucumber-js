import { afterEach, beforeEach, describe, it } from 'mocha'
import { expect } from 'chai'
import PickleRunner from './pickle_runner'
import Status from '../status'
import { EventEmitter } from 'events'
import { messages } from 'cucumber-messages'
import { incrementing } from 'cucumber-messages/dist/src/IdGenerator'
import { parse } from '../../test/gherkin_helpers'
import { buildSupportCodeLibrary } from '../../test/runtime_helpers'
import FakeTimers, { InstalledClock } from '@sinonjs/fake-timers'
import timeMethods, { millisecondsToDuration, getZeroDuration } from '../time'
import { getBaseSupportCodeLibrary } from '../../test/fixtures/steps'
import { ISupportCodeLibrary } from '../support_code_library_builder/types'
import { valueOrDefault } from '../value_checker'
import IEnvelope = messages.IEnvelope

interface ITestPickleRunnerRequest {
  gherkinDocument: messages.IGherkinDocument
  pickle: messages.IPickle
  retries?: number
  skip?: boolean
  supportCodeLibrary: ISupportCodeLibrary
}

interface ITestPickleRunnerResponse {
  envelopes: messages.IEnvelope[]
  result: messages.ITestResult
}

async function testPickleRunner(
  options: ITestPickleRunnerRequest
): Promise<ITestPickleRunnerResponse> {
  const envelopes: IEnvelope[] = []
  const eventBroadcaster = new EventEmitter()
  eventBroadcaster.on('envelope', e => envelopes.push(e))
  const pickleRunner = new PickleRunner({
    eventBroadcaster,
    gherkinDocument: options.gherkinDocument,
    newId: incrementing(),
    pickle: options.pickle,
    retries: valueOrDefault(options.retries, 0),
    skip: valueOrDefault(options.skip, false),
    supportCodeLibrary: options.supportCodeLibrary,
    worldParameters: {},
  })
  const result = await pickleRunner.run()
  return { envelopes, result }
}

describe('PickleRunner', () => {
  let clock: InstalledClock

  beforeEach(() => {
    clock = FakeTimers.install({ target: timeMethods })
  })

  afterEach(() => {
    clock.uninstall()
  })

  describe('run()', () => {
    describe('with a passing step', () => {
      it('emits testCase / testCaseStarted / testStepStarted / testStepFinished / testCaseFinished envelopes and returns the result', async () => {
        // Arrange
        const supportCodeLibrary = buildSupportCodeLibrary(({ Given }) => {
          Given('a step', function() {
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
        const passedTestResult = messages.TestResult.fromObject({
          duration: millisecondsToDuration(1),
          status: Status.PASSED,
        })

        // Act
        const { envelopes, result } = await testPickleRunner({
          gherkinDocument,
          pickle,
          supportCodeLibrary,
        })

        // Assert
        expect(envelopes).to.eql([
          messages.Envelope.fromObject({
            testCase: {
              id: '0',
              pickleId: pickle.id,
              testSteps: [
                {
                  id: '1',
                  pickleStepId: pickle.steps[0].id,
                  stepDefinitionIds: [supportCodeLibrary.stepDefinitions[0].id],
                },
              ],
            },
          }),
          messages.Envelope.fromObject({
            testCaseStarted: {
              attempt: 0,
              id: '2',
              testCaseId: '0',
            },
          }),
          messages.Envelope.fromObject({
            testStepStarted: {
              testCaseStartedId: '2',
              testStepId: '1',
            },
          }),
          messages.Envelope.fromObject({
            testStepFinished: {
              testCaseStartedId: '2',
              testResult: passedTestResult,
              testStepId: '1',
            },
          }),
          messages.Envelope.fromObject({
            testCaseFinished: {
              testCaseStartedId: '2',
              testResult: passedTestResult,
            },
          }),
        ])
        expect(result).to.eql(envelopes[4].testCaseFinished.testResult)
      })
    })

    describe('with a failing step', () => {
      it('emits and returns failing results', async () => {
        // Arrange
        const supportCodeLibrary = buildSupportCodeLibrary(({ Given }) => {
          Given('a step', function() {
            throw 'fail' // eslint-disable-line @typescript-eslint/no-throw-literal
          })
        })
        const {
          gherkinDocument,
          pickles: [pickle],
        } = await parse({
          data: ['Feature: a', 'Scenario: b', 'Given a step'].join('\n'),
          uri: 'a.feature',
        })
        const failingTestResult = messages.TestResult.fromObject({
          duration: millisecondsToDuration(0),
          status: Status.FAILED,
          message: 'fail',
        })

        // Act
        const { envelopes, result } = await testPickleRunner({
          gherkinDocument,
          pickle,
          supportCodeLibrary,
        })

        // Assert
        expect(envelopes).to.have.lengthOf(5)
        expect(envelopes[3].testStepFinished.testResult).to.eql(
          failingTestResult
        )
        expect(envelopes[4].testCaseFinished.testResult).to.eql(
          failingTestResult
        )
        expect(result).to.eql(envelopes[4].testCaseFinished.testResult)
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
          data: ['Feature: a', 'Scenario: b', 'Given an ambiguous step'].join(
            '\n'
          ),
          uri: 'a.feature',
        })
        const message = [
          'Multiple step definitions match:',
          '  an ambiguous step    - steps.ts:13',
          '  /an? ambiguous step/ - steps.ts:14',
        ].join('\n')

        // Act
        const { envelopes, result } = await testPickleRunner({
          gherkinDocument,
          pickle,
          supportCodeLibrary,
        })

        // Assert
        expect(envelopes).to.have.lengthOf(5)
        expect(envelopes[3].testStepFinished.testResult).to.eql(
          messages.TestResult.fromObject({
            message,
            status: Status.AMBIGUOUS,
          })
        )
        expect(envelopes[4].testCaseFinished.testResult).to.eql(
          messages.TestResult.fromObject({
            duration: getZeroDuration(),
            message,
            status: Status.AMBIGUOUS,
          })
        )
        expect(result).to.eql(envelopes[4].testCaseFinished.testResult)
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
        const { envelopes, result } = await testPickleRunner({
          gherkinDocument,
          pickle,
          supportCodeLibrary,
        })

        // Assert
        expect(envelopes).to.have.lengthOf(5)
        expect(envelopes[3].testStepFinished.testResult).to.eql(
          messages.TestResult.fromObject({
            status: Status.UNDEFINED,
          })
        )
        expect(envelopes[4].testCaseFinished.testResult).to.eql(
          messages.TestResult.fromObject({
            duration: getZeroDuration(),
            status: Status.UNDEFINED,
          })
        )
        expect(result).to.eql(envelopes[4].testCaseFinished.testResult)
      })
    })

    describe('with a flaky step and a positive retries value', () => {
      it('emits the expected envelopes and returns a passing result', async () => {
        // Arrange
        const supportCodeLibrary = buildSupportCodeLibrary(({ Given }) => {
          let willPass = false
          Given('a step', function() {
            if (willPass) {
              return
            }
            willPass = true
            throw 'error' // eslint-disable-line @typescript-eslint/no-throw-literal
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
        const { envelopes, result } = await testPickleRunner({
          gherkinDocument,
          pickle,
          retries: 1,
          supportCodeLibrary,
        })

        // Assert
        expect(envelopes).to.eql([
          messages.Envelope.fromObject({
            testCase: {
              id: '0',
              pickleId: pickle.id,
              testSteps: [
                {
                  id: '1',
                  pickleStepId: pickle.steps[0].id,
                  stepDefinitionIds: [supportCodeLibrary.stepDefinitions[0].id],
                },
              ],
            },
          }),
          messages.Envelope.fromObject({
            testCaseStarted: {
              attempt: 0,
              id: '2',
              testCaseId: '0',
            },
          }),
          messages.Envelope.fromObject({
            testStepStarted: {
              testCaseStartedId: '2',
              testStepId: '1',
            },
          }),
          messages.Envelope.fromObject({
            testStepFinished: {
              testCaseStartedId: '2',
              testResult: {
                duration: millisecondsToDuration(0),
                message: 'error',
                status: Status.FAILED,
              },
              testStepId: '1',
            },
          }),
          messages.Envelope.fromObject({
            testCaseFinished: {
              testCaseStartedId: '2',
              testResult: {
                duration: millisecondsToDuration(0),
                message: 'error',
                status: Status.FAILED,
                willBeRetried: true,
              },
            },
          }),
          messages.Envelope.fromObject({
            testCaseStarted: {
              attempt: 1,
              id: '3',
              testCaseId: '0',
            },
          }),
          messages.Envelope.fromObject({
            testStepStarted: {
              testCaseStartedId: '3',
              testStepId: '1',
            },
          }),
          messages.Envelope.fromObject({
            testStepFinished: {
              testCaseStartedId: '3',
              testResult: {
                duration: millisecondsToDuration(0),
                status: Status.PASSED,
              },
              testStepId: '1',
            },
          }),
          messages.Envelope.fromObject({
            testCaseFinished: {
              testCaseStartedId: '3',
              testResult: {
                duration: millisecondsToDuration(0),
                status: Status.PASSED,
              },
            },
          }),
        ])
        expect(result).to.eql(envelopes[8].testCaseFinished.testResult)
      })
    })

    describe('with a step when skipping', () => {
      it('emits the expected envelopes and returns a skipped result', async () => {
        // Arrange
        const supportCodeLibrary = buildSupportCodeLibrary(({ Given }) => {
          Given('a step', function() {
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
        const { envelopes, result } = await testPickleRunner({
          gherkinDocument,
          pickle,
          skip: true,
          supportCodeLibrary,
        })

        // Assert
        expect(envelopes).to.have.lengthOf(5)
        expect(envelopes[3].testStepFinished.testResult).to.eql(
          messages.TestResult.fromObject({
            status: Status.SKIPPED,
          })
        )
        expect(envelopes[4].testCaseFinished.testResult).to.eql(
          messages.TestResult.fromObject({
            duration: getZeroDuration(),
            status: Status.SKIPPED,
          })
        )
        expect(result).to.eql(envelopes[4].testCaseFinished.testResult)
      })
    })

    describe('with hooks', () => {
      it('emits the expected envelopes and returns a skipped result', async () => {
        // Arrange
        const supportCodeLibrary = buildSupportCodeLibrary(
          ({ Given, Before, After }) => {
            Given('a step', function() {
              clock.tick(1)
            })
            Before(function() {}) // eslint-disable-line @typescript-eslint/no-empty-function
            After(function() {}) // eslint-disable-line @typescript-eslint/no-empty-function
          }
        )
        const {
          gherkinDocument,
          pickles: [pickle],
        } = await parse({
          data: ['Feature: a', 'Scenario: b', 'Given a step'].join('\n'),
          uri: 'a.feature',
        })

        // Act
        const { envelopes, result } = await testPickleRunner({
          gherkinDocument,
          pickle,
          supportCodeLibrary,
        })

        // Assert
        expect(envelopes).to.have.lengthOf(9)
        expect(envelopes[0]).to.eql(
          messages.Envelope.fromObject({
            testCase: {
              id: '0',
              pickleId: pickle.id,
              testSteps: [
                {
                  id: '1',
                  hookId: [
                    supportCodeLibrary.beforeTestCaseHookDefinitions[0].id,
                  ],
                },
                {
                  id: '2',
                  pickleStepId: pickle.steps[0].id,
                  stepDefinitionIds: [supportCodeLibrary.stepDefinitions[0].id],
                },
                {
                  id: '3',
                  hookId: [
                    supportCodeLibrary.afterTestCaseHookDefinitions[0].id,
                  ],
                },
              ],
            },
          })
        )
        expect(result).to.eql(envelopes[8].testCaseFinished.testResult)
      })
    })
  })
})
