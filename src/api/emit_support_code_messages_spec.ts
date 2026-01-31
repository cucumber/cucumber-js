import { EventEmitter } from 'node:events'
import * as messages from '@cucumber/messages'
import { HookType, IdGenerator } from '@cucumber/messages'
import { expect } from 'chai'
import { describe, it } from 'mocha'
import {
  CucumberExpression,
  ParameterType,
  RegularExpression,
} from '@cucumber/cucumber-expressions'
import StepDefinition from '../models/step_definition'
import { SupportCodeLibrary } from '../support_code_library_builder/types'
import TestCaseHookDefinition from '../models/test_case_hook_definition'
import TestRunHookDefinition from '../models/test_run_hook_definition'
import { SourcedParameterTypeRegistry } from '../support_code_library_builder/sourced_parameter_type_registry'
import {
  emitMetaMessage,
  emitSupportCodeMessages,
} from './emit_support_code_messages'

const noopFunction = (): void => {
  // no code
}

function testEmitSupportCodeMessages(
  supportCode: Partial<SupportCodeLibrary>
): messages.Envelope[] {
  const envelopes: messages.Envelope[] = []
  const eventBroadcaster = new EventEmitter()
  eventBroadcaster.on('envelope', (e) => envelopes.push(e))
  emitSupportCodeMessages({
    eventBroadcaster,
    supportCodeLibrary: Object.assign(
      {
        originalCoordinates: {
          requireModules: [],
          requirePaths: [],
          importPaths: [],
        },
        stepDefinitions: [],
        beforeTestRunHookDefinitions: [],
        beforeTestCaseHookDefinitions: [],
        beforeTestStepHookDefinitions: [],
        afterTestRunHookDefinitions: [],
        afterTestCaseHookDefinitions: [],
        afterTestStepHookDefinitions: [],
        defaultTimeout: 0,
        parameterTypeRegistry: new SourcedParameterTypeRegistry(),
        undefinedParameterTypes: [],
        World: null,
        parallelCanAssign: () => true,
      },
      supportCode
    ),
    newId: IdGenerator.incrementing(),
  })
  return envelopes
}

describe('emit_support_code_messages', () => {
  describe('emitMetaMessage', () => {
    it('emits a meta message', async () => {
      const envelopes: messages.Envelope[] = []
      const eventBroadcaster = new EventEmitter()
      eventBroadcaster.on('envelope', (e) => envelopes.push(e))
      await emitMetaMessage(eventBroadcaster, {})

      expect(envelopes).to.have.length(1)
      expect(envelopes[0].meta.implementation.name).to.eq('cucumber-js')
    })
  })

  describe('emitSupportCodeMessages', () => {
    it('emits messages for parameter types', () => {
      const parameterTypeRegistry = new SourcedParameterTypeRegistry()
      parameterTypeRegistry.defineSourcedParameterType(
        new ParameterType<string>(
          'flight',
          ['([A-Z]{3})-([A-Z]{3})'],
          null,
          () => 'argh',
          true,
          false
        ),
        {
          line: 4,
          uri: 'features/support/parameter-types.js',
        },
        0
      )

      const envelopes = testEmitSupportCodeMessages({
        parameterTypeRegistry,
      })

      const expectedEnvelopes: messages.Envelope[] = [
        {
          parameterType: {
            id: '0',
            name: 'flight',
            preferForRegularExpressionMatch: false,
            regularExpressions: ['([A-Z]{3})-([A-Z]{3})'],
            useForSnippets: true,
            sourceReference: {
              uri: 'features/support/parameter-types.js',
              location: {
                line: 4,
              },
            },
          },
        },
      ]
      expect(envelopes).to.deep.eq(expectedEnvelopes)
    })

    it('emits messages for step definitions using cucumber expressions', () => {
      const envelopes = testEmitSupportCodeMessages({
        stepDefinitions: [
          new StepDefinition({
            code: noopFunction,
            unwrappedCode: noopFunction,
            id: '0',
            line: 9,
            options: {},
            order: 0,
            uri: 'features/support/cukes.js',
            keyword: 'Given',
            pattern: 'I have {int} cukes in my belly',
            expression: new CucumberExpression(
              'I have {int} cukes in my belly',
              new SourcedParameterTypeRegistry()
            ),
          }),
        ],
      })

      const expectedEnvelopes: messages.Envelope[] = [
        {
          stepDefinition: {
            id: '0',
            pattern: {
              source: 'I have {int} cukes in my belly',
              type: messages.StepDefinitionPatternType.CUCUMBER_EXPRESSION,
            },
            sourceReference: {
              uri: 'features/support/cukes.js',
              location: {
                line: 9,
              },
            },
          },
        },
      ]
      expect(envelopes).to.deep.eq(expectedEnvelopes)
    })

    it('emits messages for step definitions using regular expressions', () => {
      const envelopes = testEmitSupportCodeMessages({
        stepDefinitions: [
          new StepDefinition({
            code: noopFunction,
            unwrappedCode: noopFunction,
            id: '0',
            line: 9,
            options: {},
            order: 0,
            uri: 'features/support/cukes.js',
            keyword: 'Given',
            pattern: /I have (\d+) cukes in my belly/,
            expression: new RegularExpression(
              /I have (\d+) cukes in my belly/,
              new SourcedParameterTypeRegistry()
            ),
          }),
        ],
      })

      const expectedEnvelopes: messages.Envelope[] = [
        {
          stepDefinition: {
            id: '0',
            pattern: {
              source: 'I have (\\d+) cukes in my belly',
              type: messages.StepDefinitionPatternType.REGULAR_EXPRESSION,
            },
            sourceReference: {
              uri: 'features/support/cukes.js',
              location: {
                line: 9,
              },
            },
          },
        },
      ]
      expect(envelopes).to.deep.eq(expectedEnvelopes)
    })

    it('emits messages for test case level hooks', () => {
      const envelopes = testEmitSupportCodeMessages({
        beforeTestCaseHookDefinitions: [
          new TestCaseHookDefinition({
            code: noopFunction,
            unwrappedCode: noopFunction,
            id: '0',
            line: 3,
            options: {
              name: 'before hook',
              tags: '@hooks-tho',
            },
            order: 0,
            uri: 'features/support/hooks.js',
          }),
        ],
        afterTestCaseHookDefinitions: [
          new TestCaseHookDefinition({
            code: noopFunction,
            unwrappedCode: noopFunction,
            id: '1',
            line: 7,
            options: {
              name: 'after hook',
            },
            order: 1,
            uri: 'features/support/hooks.js',
          }),
          new TestCaseHookDefinition({
            code: noopFunction,
            unwrappedCode: noopFunction,
            id: '2',
            line: 11,
            options: {},
            order: 2,
            uri: 'features/support/hooks.js',
          }),
        ],
      })

      const expectedEnvelopes: messages.Envelope[] = [
        {
          hook: {
            id: '0',
            type: HookType.BEFORE_TEST_CASE,
            name: 'before hook',
            tagExpression: '@hooks-tho',
            sourceReference: {
              uri: 'features/support/hooks.js',
              location: {
                line: 3,
              },
            },
          },
        },
        {
          hook: {
            id: '1',
            type: HookType.AFTER_TEST_CASE,
            name: 'after hook',
            tagExpression: undefined,
            sourceReference: {
              uri: 'features/support/hooks.js',
              location: {
                line: 7,
              },
            },
          },
        },
        {
          hook: {
            id: '2',
            type: HookType.AFTER_TEST_CASE,
            name: undefined,
            tagExpression: undefined,
            sourceReference: {
              uri: 'features/support/hooks.js',
              location: {
                line: 11,
              },
            },
          },
        },
      ]
      expect(envelopes).to.deep.eq(expectedEnvelopes)
    })

    it('emits messages for test run level hooks', () => {
      const envelopes = testEmitSupportCodeMessages({
        beforeTestRunHookDefinitions: [
          new TestRunHookDefinition({
            code: noopFunction,
            unwrappedCode: noopFunction,
            id: '0',
            line: 3,
            options: {},
            order: 0,
            uri: 'features/support/run-hooks.js',
          }),
        ],
        afterTestRunHookDefinitions: [
          new TestRunHookDefinition({
            code: noopFunction,
            unwrappedCode: noopFunction,
            id: '1',
            line: 7,
            options: {
              name: 'special cleanup thing',
            },
            order: 1,
            uri: 'features/support/run-hooks.js',
          }),
          new TestRunHookDefinition({
            code: noopFunction,
            unwrappedCode: noopFunction,
            id: '2',
            line: 11,
            options: {},
            order: 2,
            uri: 'features/support/run-hooks.js',
          }),
        ],
      })

      const expectedEnvelopes: messages.Envelope[] = [
        {
          hook: {
            id: '0',
            type: HookType.BEFORE_TEST_RUN,
            name: undefined,
            sourceReference: {
              uri: 'features/support/run-hooks.js',
              location: {
                line: 3,
              },
            },
          },
        },
        {
          hook: {
            id: '1',
            type: HookType.AFTER_TEST_RUN,
            name: 'special cleanup thing',
            sourceReference: {
              uri: 'features/support/run-hooks.js',
              location: {
                line: 7,
              },
            },
          },
        },
        {
          hook: {
            id: '2',
            type: HookType.AFTER_TEST_RUN,
            name: undefined,
            sourceReference: {
              uri: 'features/support/run-hooks.js',
              location: {
                line: 11,
              },
            },
          },
        },
      ]
      expect(envelopes).to.deep.eq(expectedEnvelopes)
    })
  })
})
