import { EventEmitter } from 'node:events'
import {
  Envelope,
  GherkinDocument,
  IdGenerator,
  Pickle,
  TestCase,
} from '@cucumber/messages'
import { afterEach, beforeEach, describe, it } from 'mocha'
import FakeTimers, { InstalledClock } from '@sinonjs/fake-timers'
import { expect } from 'chai'
import timeMethods from '../time'
import { buildSupportCodeLibrary } from '../../test/runtime_helpers'
import { parse } from '../../test/gherkin_helpers'
import { SupportCodeLibrary } from '../support_code_library_builder/types'
import { assembleTestCases } from './assemble_test_cases'
import { AssembledTestCase } from './types'

async function testAssembleTestCases({
  gherkinDocument,
  pickles,
  supportCodeLibrary,
}: {
  gherkinDocument: GherkinDocument
  pickles: Pickle[]
  supportCodeLibrary: SupportCodeLibrary
}): Promise<{
  envelopes: Envelope[]
  result: ReadonlyArray<AssembledTestCase>
}> {
  const envelopes: Envelope[] = []
  const eventBroadcaster = new EventEmitter()
  eventBroadcaster.on('envelope', (e) => envelopes.push(e))
  const newId = IdGenerator.incrementing()
  const result = await assembleTestCases(
    newId(),
    eventBroadcaster,
    newId,
    pickles.map((pickle) => ({
      gherkinDocument,
      pickle,
    })),
    supportCodeLibrary
  )
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

      const testCase0: TestCase = {
        testRunStartedId: '0',
        id: '1',
        pickleId: pickles[0].id,
        testSteps: [
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
        ],
      }

      const testCase1: TestCase = {
        testRunStartedId: '0',
        id: '3',
        pickleId: pickles[1].id,
        testSteps: [
          {
            id: '4',
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
          testCase: testCase0,
        },
        {
          testCase: testCase1,
        },
      ])

      expect(result).to.eql([
        {
          gherkinDocument,
          pickle: pickles[0],
          testCase: testCase0,
        },
        {
          gherkinDocument,
          pickle: pickles[1],
          testCase: testCase1,
        },
      ])
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
            testRunStartedId: '0',
            id: '1',
            pickleId: pickles[0].id,
            testSteps: [
              {
                id: '2',
                hookId: supportCodeLibrary.beforeTestCaseHookDefinitions[0].id,
              },
              {
                id: '3',
                pickleStepId: pickles[0].steps[0].id,
                stepDefinitionIds: [supportCodeLibrary.stepDefinitions[0].id],
                stepMatchArgumentsLists: [
                  {
                    stepMatchArguments: [],
                  },
                ],
              },
              {
                id: '4',
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
            testRunStartedId: '0',
            id: '1',
            pickleId: pickles[0].id,
            testSteps: [
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
            ],
          },
        })
      })
    })
  })
})
