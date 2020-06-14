import { afterEach, beforeEach, describe, it } from 'mocha'
import { expect } from 'chai'
import PickleRunner from './pickle_runner'
import Status from '../status'
import { EventEmitter } from 'events'
import { IdGenerator, messages } from '@cucumber/messages'
import { parse } from '../../test/gherkin_helpers'
import { buildSupportCodeLibrary } from '../../test/runtime_helpers'
import FakeTimers, { InstalledClock } from '@sinonjs/fake-timers'
import timeMethods, { millisecondsToDuration } from '../time'
import { getBaseSupportCodeLibrary } from '../../test/fixtures/steps'
import { ISupportCodeLibrary } from '../support_code_library_builder/types'
import { valueOrDefault } from '../value_checker'
import { fail } from 'assert'
import { PredictableTestRunStopwatch } from './stopwatch'
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
  result: messages.TestStepFinished.ITestStepResult
}

async function testPickleRunner(
  options: ITestPickleRunnerRequest
): Promise<ITestPickleRunnerResponse> {
  const envelopes: IEnvelope[] = []
  const eventBroadcaster = new EventEmitter()
  eventBroadcaster.on('envelope', e => envelopes.push(e))
  const pickleRunner = new PickleRunner({
    eventBroadcaster,
    stopwatch: new PredictableTestRunStopwatch(),
    gherkinDocument: options.gherkinDocument,
    newId: IdGenerator.incrementing(),
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
        const passedTestResult = messages.TestStepFinished.TestStepResult.fromObject(
          {
            duration: millisecondsToDuration(1),
            status: Status.PASSED,
          }
        )

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
              timestamp: {
                nanos: 1000000,
                seconds: {
                  high: 0,
                  low: 0,
                  unsigned: false,
                },
              },
            },
          }),
          messages.Envelope.fromObject({
            testStepStarted: {
              testCaseStartedId: '2',
              testStepId: '1',
              timestamp: {
                nanos: 2000000,
                seconds: {
                  high: 0,
                  low: 0,
                  unsigned: false,
                },
              },
            },
          }),
          messages.Envelope.fromObject({
            testStepFinished: {
              testCaseStartedId: '2',
              testStepResult: passedTestResult,
              testStepId: '1',
              timestamp: {
                nanos: 3000000,
                seconds: {
                  high: 0,
                  low: 0,
                  unsigned: false,
                },
              },
            },
          }),
          messages.Envelope.fromObject({
            testCaseFinished: {
              testCaseStartedId: '2',
              testResult: passedTestResult,
              timestamp: {
                nanos: 4000000,
                seconds: {
                  high: 0,
                  low: 0,
                  unsigned: false,
                },
              },
            },
          }),
        ])
        expect(result).to.eql(passedTestResult)
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
        const failingTestResult = messages.TestStepFinished.TestStepResult.fromObject(
          {
            duration: millisecondsToDuration(0),
            status: Status.FAILED,
            message: 'fail',
          }
        )

        // Act
        const { envelopes, result } = await testPickleRunner({
          gherkinDocument,
          pickle,
          supportCodeLibrary,
        })

        // Assert
        expect(envelopes).to.have.lengthOf(5)
        expect(envelopes[3].testStepFinished.testStepResult).to.eql(
          failingTestResult
        )
        expect(result).to.eql(failingTestResult)
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
        // expect(envelopes[3].testStepFinished.testResult).to.eql(
        //   messages.TestStepFinished.TestStepResult.fromObject({
        //     message,
        //     status: Status.AMBIGUOUS,
        //   })
        // )
        // expect(envelopes[4].testCaseFinished.testResult).to.eql(
        //   messages.TestStepFinished.TestStepResult.fromObject({
        //     duration: getZeroDuration(),
        //     message,
        //     status: Status.AMBIGUOUS,
        //   })
        // )
        // expect(result).to.eql(envelopes[4].testCaseFinished.testResult)
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
        // expect(envelopes[3].testStepFinished.testResult).to.eql(
        //   messages.TestStepFinished.TestStepResult.fromObject({
        //     status: Status.UNDEFINED,
        //   })
        // )
        // expect(envelopes[4].testCaseFinished.testResult).to.eql(
        //   messages.TestStepFinished.TestStepResult.fromObject({
        //     duration: getZeroDuration(),
        //     status: Status.UNDEFINED,
        //   })
        // )
        // expect(result).to.eql(envelopes[4].testCaseFinished.testResult)
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
              timestamp: {
                nanos: 1000000,
                seconds: {
                  high: 0,
                  low: 0,
                  unsigned: false,
                },
              },
            },
          }),
          messages.Envelope.fromObject({
            testStepStarted: {
              testCaseStartedId: '2',
              testStepId: '1',
              timestamp: {
                nanos: 2000000,
                seconds: {
                  high: 0,
                  low: 0,
                  unsigned: false,
                },
              },
            },
          }),
          messages.Envelope.fromObject({
            testStepFinished: {
              testCaseStartedId: '2',
              testStepResult: {
                duration: millisecondsToDuration(0),
                message: 'error',
                status: Status.FAILED,
              },
              testStepId: '1',
              timestamp: {
                nanos: 3000000,
                seconds: {
                  high: 0,
                  low: 0,
                  unsigned: false,
                },
              },
            },
          }),
          messages.Envelope.fromObject({
            testCaseFinished: {
              testCaseStartedId: '2',
              testStepResult: {
                duration: millisecondsToDuration(0),
                message: 'error',
                status: Status.FAILED,
                willBeRetried: true,
              },
              timestamp: {
                nanos: 4000000,
                seconds: {
                  high: 0,
                  low: 0,
                  unsigned: false,
                },
              },
            },
          }),
          messages.Envelope.fromObject({
            testCaseStarted: {
              attempt: 1,
              id: '3',
              testCaseId: '0',
              timestamp: {
                nanos: 5000000,
                seconds: {
                  high: 0,
                  low: 0,
                  unsigned: false,
                },
              },
            },
          }),
          messages.Envelope.fromObject({
            testStepStarted: {
              testCaseStartedId: '3',
              testStepId: '1',
              timestamp: {
                nanos: 6000000,
                seconds: {
                  high: 0,
                  low: 0,
                  unsigned: false,
                },
              },
            },
          }),
          messages.Envelope.fromObject({
            testStepFinished: {
              testCaseStartedId: '3',
              testStepResult: {
                duration: millisecondsToDuration(0),
                status: Status.PASSED,
              },
              testStepId: '1',
              timestamp: {
                nanos: 7000000,
                seconds: {
                  high: 0,
                  low: 0,
                  unsigned: false,
                },
              },
            },
          }),
          messages.Envelope.fromObject({
            testCaseFinished: {
              testCaseStartedId: '3',
              testStepResult: {
                duration: millisecondsToDuration(0),
                status: Status.PASSED,
              },
              timestamp: {
                nanos: 8000000,
                seconds: {
                  high: 0,
                  low: 0,
                  unsigned: false,
                },
              },
            },
          }),
        ])
        // expect(result).to.eql(envelopes[8].testCaseFinished.testResult)
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
        // expect(envelopes[3].testStepFinished.testResult).to.eql(
        //   messages.TestStepFinished.TestStepResult.fromObject({
        //     status: Status.SKIPPED,
        //   })
        // )
        // expect(envelopes[4].testCaseFinished.testResult).to.eql(
        //   messages.TestStepFinished.TestStepResult.fromObject({
        //     duration: getZeroDuration(),
        //     status: Status.SKIPPED,
        //   })
        // )
        // expect(result).to.eql(envelopes[4].testCaseFinished.testResult)
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
        // expect(result).to.eql(envelopes[8].testCaseFinished.testResult)
      })
    })
  })
})
