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
  result: messages.TestStepFinished.TestStepResult.Status
}

async function testPickleRunner(
  options: ITestPickleRunnerRequest
): Promise<ITestPickleRunnerResponse> {
  const envelopes: IEnvelope[] = []
  const eventBroadcaster = new EventEmitter()
  eventBroadcaster.on('envelope', (e) => envelopes.push(e))
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

function predictableTimestamp(counter: number): any {
  return {
    nanos: 1000000 * counter,
    seconds: {
      high: 0,
      low: 0,
      unsigned: false,
    },
  }
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
          Given('a step', function () {
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
                  stepMatchArgumentsLists: [
                    {
                      stepMatchArguments: [],
                    },
                  ],
                },
              ],
            },
          }),
          messages.Envelope.fromObject({
            testCaseStarted: {
              attempt: 0,
              id: '2',
              testCaseId: '0',
              timestamp: predictableTimestamp(0),
            },
          }),
          messages.Envelope.fromObject({
            testStepStarted: {
              testCaseStartedId: '2',
              testStepId: '1',
              timestamp: predictableTimestamp(1),
            },
          }),
          messages.Envelope.fromObject({
            testStepFinished: {
              testCaseStartedId: '2',
              testStepResult: passedTestResult,
              testStepId: '1',
              timestamp: predictableTimestamp(2),
            },
          }),
          messages.Envelope.fromObject({
            testCaseFinished: {
              testCaseStartedId: '2',
              timestamp: predictableTimestamp(3),
            },
          }),
        ])
        expect(result).to.eql(Status.PASSED)
      })
    })

    describe('with a parameterised step', () => {
      it('emits stepMatchArgumentLists correctly within the testCase message', async () => {
        // Arrange
        const supportCodeLibrary = buildSupportCodeLibrary(({ Given }) => {
          Given('a step with {int} and {string} parameters', function () {
            clock.tick(1)
          })
        })
        const {
          gherkinDocument,
          pickles: [pickle],
        } = await parse({
          data: [
            'Feature: a',
            'Scenario: b',
            'Given a step with 1 and "foo" parameters',
          ].join('\n'),
          uri: 'a.feature',
        })

        // Act
        const { envelopes } = await testPickleRunner({
          gherkinDocument,
          pickle,
          supportCodeLibrary,
        })

        expect(
          envelopes[0].testCase.testSteps[0].stepMatchArgumentsLists
        ).to.deep.eq([
          messages.TestCase.TestStep.StepMatchArgumentsList.fromObject({
            stepMatchArguments: [
              {
                group: {
                  children: [],
                  start: 12,
                  value: '1',
                },
                parameterTypeName: 'int',
              },
              {
                group: {
                  children: [
                    {
                      children: [
                        {
                          children: [],
                        },
                      ],
                      start: 19,
                      value: 'foo',
                    },
                    {
                      children: [
                        {
                          children: [],
                        },
                      ],
                    },
                  ],
                  start: 18,
                  value: '"foo"',
                },
                parameterTypeName: 'string',
              },
            ],
          }),
        ])
      })
    })

    describe('with a failing step', () => {
      it('emits and returns failing results', async () => {
        // Arrange
        const supportCodeLibrary = buildSupportCodeLibrary(({ Given }) => {
          Given('a step', function () {
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
        expect(result).to.eql(Status.FAILED)
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
        expect(envelopes[3].testStepFinished.testStepResult).to.eql(
          messages.TestStepFinished.TestStepResult.fromObject({
            message,
            status: Status.AMBIGUOUS,
            duration: {
              seconds: '0',
              nanos: 0,
            },
          })
        )
        expect(result).to.eql(
          envelopes[3].testStepFinished.testStepResult.status
        )
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
        expect(envelopes[3].testStepFinished.testStepResult).to.eql(
          messages.TestStepFinished.TestStepResult.fromObject({
            status: Status.UNDEFINED,
            duration: {
              seconds: '0',
              nanos: 0,
            },
          })
        )
        expect(result).to.eql(
          envelopes[3].testStepFinished.testStepResult.status
        )
      })
    })

    describe('with a flaky step and a positive retries value', () => {
      it('emits the expected envelopes and returns a passing result', async () => {
        // Arrange
        const supportCodeLibrary = buildSupportCodeLibrary(({ Given }) => {
          let willPass = false
          Given('a step', function () {
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
                  stepMatchArgumentsLists: [
                    {
                      stepMatchArguments: [],
                    },
                  ],
                },
              ],
            },
          }),
          messages.Envelope.fromObject({
            testCaseStarted: {
              attempt: 0,
              id: '2',
              testCaseId: '0',
              timestamp: predictableTimestamp(0),
            },
          }),
          messages.Envelope.fromObject({
            testStepStarted: {
              testCaseStartedId: '2',
              testStepId: '1',
              timestamp: predictableTimestamp(1),
            },
          }),
          messages.Envelope.fromObject({
            testStepFinished: {
              testCaseStartedId: '2',
              testStepResult: {
                duration: millisecondsToDuration(0),
                message: 'error',
                status: Status.FAILED,
                willBeRetried: true,
              },
              testStepId: '1',
              timestamp: predictableTimestamp(2),
            },
          }),
          messages.Envelope.fromObject({
            testCaseFinished: {
              testCaseStartedId: '2',
              timestamp: predictableTimestamp(3),
            },
          }),
          messages.Envelope.fromObject({
            testCaseStarted: {
              attempt: 1,
              id: '3',
              testCaseId: '0',
              timestamp: predictableTimestamp(4),
            },
          }),
          messages.Envelope.fromObject({
            testStepStarted: {
              testCaseStartedId: '3',
              testStepId: '1',
              timestamp: predictableTimestamp(5),
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
              timestamp: predictableTimestamp(6),
            },
          }),
          messages.Envelope.fromObject({
            testCaseFinished: {
              testCaseStartedId: '3',
              timestamp: predictableTimestamp(7),
            },
          }),
        ])
        expect(result).to.eql(Status.PASSED)
      })
    })

    describe('with a step when skipping', () => {
      it('emits the expected envelopes and returns a skipped result', async () => {
        // Arrange
        const supportCodeLibrary = buildSupportCodeLibrary(({ Given }) => {
          Given('a step', function () {
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
        expect(envelopes[3].testStepFinished.testStepResult).to.eql(
          messages.TestStepFinished.TestStepResult.fromObject({
            status: Status.SKIPPED,
            duration: {
              seconds: '0',
              nanos: 0,
            },
          })
        )
        expect(result).to.eql(
          envelopes[3].testStepFinished.testStepResult.status
        )
      })
    })

    describe('with hooks', () => {
      it('emits the expected envelopes and returns a skipped result', async () => {
        // Arrange
        const supportCodeLibrary = buildSupportCodeLibrary(
          ({ Given, Before, After }) => {
            Given('a step', function () {
              clock.tick(1)
            })
            Before(function () {}) // eslint-disable-line @typescript-eslint/no-empty-function
            After(function () {}) // eslint-disable-line @typescript-eslint/no-empty-function
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
                  stepMatchArgumentsLists: [
                    {
                      stepMatchArguments: [],
                    },
                  ],
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
        expect(result).to.eql(
          envelopes[7].testStepFinished.testStepResult.status
        )
      })
    })
  })
})
