import { EventEmitter } from 'node:events'
import { IdGenerator } from '@cucumber/messages'
import * as messages from '@cucumber/messages'
import { afterEach, beforeEach, describe, it } from 'mocha'
import FakeTimers, { InstalledClock } from '@sinonjs/fake-timers'
import { expect } from 'chai'
import timeMethods from '../time'
import { buildSupportCodeLibrary } from '../../test/runtime_helpers'
import { parse } from '../../test/gherkin_helpers'
import { SupportCodeLibrary } from '../support_code_library_builder/types'
import { assembleTestCases, IAssembledTestCases } from './assemble_test_cases'

interface IRequest {
  gherkinDocument: messages.GherkinDocument
  pickles: messages.Pickle[]
  supportCodeLibrary: SupportCodeLibrary
}

interface IResponse {
  envelopes: messages.Envelope[]
  result: IAssembledTestCases
}

async function testAssembleTestCases(options: IRequest): Promise<IResponse> {
  const envelopes: messages.Envelope[] = []
  const eventBroadcaster = new EventEmitter()
  eventBroadcaster.on('envelope', (e) => envelopes.push(e))
  const result = await assembleTestCases({
    eventBroadcaster,
    newId: IdGenerator.incrementing(),
    pickles: options.pickles,
    supportCodeLibrary: options.supportCodeLibrary,
  })
  return { envelopes, result }
}

describe('assembleTestCases', () => {
  let clock: InstalledClock

  beforeEach(() => {
    clock = FakeTimers.withGlobal(timeMethods).install()
  })

  afterEach(() => {
    clock.uninstall()
  })

  describe('assembleTestCases()', () => {
    it('emits testCase messages', async () => {
      // Arrange
      const supportCodeLibrary = buildSupportCodeLibrary(({ Given }) => {
        Given('a step', function () {
          clock.tick(1)
        })
      })
      const { gherkinDocument, pickles } = await parse({
        data: [
          'Feature: a',
          'Scenario: b',
          'Given a step',
          'Scenario: c',
          'Given a step',
        ].join('\n'),
        uri: 'a.feature',
      })

      // Act
      const { envelopes, result } = await testAssembleTestCases({
        gherkinDocument,
        pickles,
        supportCodeLibrary,
      })

      const testCase1: messages.TestCase = {
        id: '0',
        pickleId: pickles[0].id,
        testSteps: [
          {
            id: '1',
            pickleStepId: pickles[0].steps[0].id,
            stepDefinitionIds: [supportCodeLibrary.stepDefinitions[0].id],
            stepMatchArgumentsLists: [
              {
                stepMatchArguments: [],
              },
            ],
          },
        ],
      }

      const testCase2: messages.TestCase = {
        id: '2',
        pickleId: pickles[1].id,
        testSteps: [
          {
            id: '3',
            pickleStepId: pickles[1].steps[0].id,
            stepDefinitionIds: [supportCodeLibrary.stepDefinitions[0].id],
            stepMatchArgumentsLists: [
              {
                stepMatchArguments: [],
              },
            ],
          },
        ],
      }

      // Assert
      expect(envelopes).to.eql([
        {
          testCase: testCase1,
        },
        {
          testCase: testCase2,
        },
      ])

      expect(Object.keys(result)).to.eql([pickles[0].id, pickles[1].id])
      expect(Object.values(result)).to.eql([testCase1, testCase2])
    })

    describe('with a parameterised step', () => {
      it('emits stepMatchArgumentLists correctly within the testCase message', async () => {
        // Arrange
        const supportCodeLibrary = buildSupportCodeLibrary(({ Given }) => {
          Given('a step with {int} and {string} parameters', function () {
            clock.tick(1)
          })
        })
        const { gherkinDocument, pickles } = await parse({
          data: [
            'Feature: a',
            'Scenario: b',
            'Given a step with 1 and "foo" parameters',
          ].join('\n'),
          uri: 'a.feature',
        })

        // Act
        const { envelopes } = await testAssembleTestCases({
          gherkinDocument,
          pickles,
          supportCodeLibrary,
        })

        expect(
          envelopes[0].testCase.testSteps[0].stepMatchArgumentsLists
        ).to.deep.eq([
          {
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
                          start: undefined,
                          value: undefined,
                          children: [],
                        },
                      ],
                      start: 19,
                      value: 'foo',
                    },
                    {
                      start: undefined,
                      value: undefined,
                      children: [
                        {
                          start: undefined,
                          value: undefined,
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
          },
        ])
      })
    })

    describe('with test case hooks', () => {
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
        const { gherkinDocument, pickles } = await parse({
          data: ['Feature: a', 'Scenario: b', 'Given a step'].join('\n'),
          uri: 'a.feature',
        })

        // Act
        const { envelopes } = await testAssembleTestCases({
          gherkinDocument,
          pickles,
          supportCodeLibrary,
        })

        // Assert
        expect(envelopes[0]).to.eql({
          testCase: {
            id: '0',
            pickleId: pickles[0].id,
            testSteps: [
              {
                id: '1',
                hookId: supportCodeLibrary.beforeTestCaseHookDefinitions[0].id,
              },
              {
                id: '2',
                pickleStepId: pickles[0].steps[0].id,
                stepDefinitionIds: [supportCodeLibrary.stepDefinitions[0].id],
                stepMatchArgumentsLists: [
                  {
                    stepMatchArguments: [],
                  },
                ],
              },
              {
                id: '3',
                hookId: supportCodeLibrary.afterTestCaseHookDefinitions[0].id,
              },
            ],
          },
        })
      })
    })

    describe('with step hooks', () => {
      it('emits the expected envelopes and returns a skipped result', async () => {
        // Arrange
        const supportCodeLibrary = buildSupportCodeLibrary(
          ({ Given, BeforeStep, AfterStep }) => {
            Given('a step', function () {
              clock.tick(1)
            })
            BeforeStep(function () {}) // eslint-disable-line @typescript-eslint/no-empty-function
            AfterStep(function () {}) // eslint-disable-line @typescript-eslint/no-empty-function
          }
        )
        const { gherkinDocument, pickles } = await parse({
          data: ['Feature: a', 'Scenario: b', 'Given a step'].join('\n'),
          uri: 'a.feature',
        })

        // Act
        const { envelopes } = await testAssembleTestCases({
          gherkinDocument,
          pickles,
          supportCodeLibrary,
        })

        // Assert
        expect(envelopes[0]).to.eql({
          testCase: {
            id: '0',
            pickleId: pickles[0].id,
            testSteps: [
              {
                id: '1',
                pickleStepId: pickles[0].steps[0].id,
                stepDefinitionIds: [supportCodeLibrary.stepDefinitions[0].id],
                stepMatchArgumentsLists: [
                  {
                    stepMatchArguments: [],
                  },
                ],
              },
            ],
          },
        })
      })
    })
  })
})
