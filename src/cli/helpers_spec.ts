import { describe, it } from 'mocha'
import { expect } from 'chai'
import {
  emitMetaMessage,
  emitSupportCodeMessages,
  parseGherkinMessageStream,
} from './helpers'
import { EventEmitter } from 'events'
import PickleFilter from '../pickle_filter'
import { messages, IdGenerator } from '@cucumber/messages'
import { EventDataCollector } from '../formatter/helpers'
import { GherkinStreams } from '@cucumber/gherkin'
import { Readable } from 'stream'
import StepDefinition from '../models/step_definition'
import {
  CucumberExpression,
  ParameterType,
  ParameterTypeRegistry,
  RegularExpression,
} from '@cucumber/cucumber-expressions'
import { ISupportCodeLibrary } from '../support_code_library_builder/types'
import TestCaseHookDefinition from '../models/test_case_hook_definition'
import TestRunHookDefinition from '../models/test_run_hook_definition'
import TestStepHookDefinition from '../models/test_step_hook_definition'

const noopFunction = (): void => {
  // no code
}

interface ITestParseGherkinMessageStreamRequest {
  cwd: string
  gherkinMessageStream: Readable
  order: string
  pickleFilter: PickleFilter
}

interface ITestParseGherkinMessageStreamResponse {
  envelopes: messages.IEnvelope[]
  result: string[]
}

async function testParseGherkinMessageStream(
  options: ITestParseGherkinMessageStreamRequest
): Promise<ITestParseGherkinMessageStreamResponse> {
  const envelopes: messages.IEnvelope[] = []
  const eventBroadcaster = new EventEmitter()
  eventBroadcaster.on('envelope', (e) => envelopes.push(e))
  const eventDataCollector = new EventDataCollector(eventBroadcaster)
  const result = await parseGherkinMessageStream({
    cwd: options.cwd,
    eventBroadcaster,
    eventDataCollector,
    gherkinMessageStream: options.gherkinMessageStream,
    order: options.order,
    pickleFilter: options.pickleFilter,
  })
  return { envelopes, result }
}

function testEmitSupportCodeMessages(
  supportCode: Partial<ISupportCodeLibrary>
): messages.IEnvelope[] {
  const envelopes: messages.IEnvelope[] = []
  const eventBroadcaster = new EventEmitter()
  eventBroadcaster.on('envelope', (e) => envelopes.push(e))
  emitSupportCodeMessages({
    eventBroadcaster,
    supportCodeLibrary: Object.assign(
      {
        stepDefinitions: [],
        beforeTestRunHookDefinitions: [],
        beforeTestCaseHookDefinitions: [],
        beforeTestStepHookDefinitions: [],
        afterTestRunHookDefinitions: [],
        afterTestCaseHookDefinitions: [],
        afterTestStepHookDefinitions: [],
        defaultTimeout: 0,
        parameterTypeRegistry: new ParameterTypeRegistry(),
        undefinedParameterTypes: [],
        World: null,
      },
      supportCode
    ),
    newId: IdGenerator.incrementing(),
  })
  return envelopes
}

describe('helpers', () => {
  describe('emitMetaMessage', () => {
    it('emits a meta message', async () => {
      const envelopes: messages.IEnvelope[] = []
      const eventBroadcaster = new EventEmitter()
      eventBroadcaster.on('envelope', (e) => envelopes.push(e))
      await emitMetaMessage(eventBroadcaster)

      expect(envelopes).to.have.length(1)
      expect(envelopes[0].meta.implementation.name).to.eq('cucumber-js')
    })
  })
  describe('emitSupportCodeMessages', () => {
    it('emits messages for parameter types', () => {
      const parameterTypeRegistry = new ParameterTypeRegistry()
      parameterTypeRegistry.defineParameterType(
        new ParameterType<string>(
          'flight',
          ['([A-Z]{3})-([A-Z]{3})'],
          null,
          () => 'argh',
          true,
          false
        )
      )

      const envelopes = testEmitSupportCodeMessages({
        parameterTypeRegistry,
      })

      expect(envelopes).to.deep.eq([
        messages.Envelope.fromObject({
          parameterType: {
            id: '0',
            name: 'flight',
            preferForRegularExpressionMatch: false,
            regularExpressions: ['([A-Z]{3})-([A-Z]{3})'],
            useForSnippets: true,
          },
        }),
      ])
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
            uri: 'features/support/cukes.js',
            pattern: 'I have {int} cukes in my belly',
            expression: new CucumberExpression(
              'I have {int} cukes in my belly',
              new ParameterTypeRegistry()
            ),
          }),
        ],
      })

      expect(envelopes).to.deep.eq([
        messages.Envelope.fromObject({
          stepDefinition: {
            id: '0',
            pattern: {
              source: 'I have {int} cukes in my belly',
              type:
                messages.StepDefinition.StepDefinitionPattern
                  .StepDefinitionPatternType.CUCUMBER_EXPRESSION,
            },
            sourceReference: {
              uri: 'features/support/cukes.js',
              location: {
                line: 9,
              },
            },
          },
        }),
      ])
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
            uri: 'features/support/cukes.js',
            pattern: /I have (\d+) cukes in my belly/,
            expression: new RegularExpression(
              /I have (\d+) cukes in my belly/,
              new ParameterTypeRegistry()
            ),
          }),
        ],
      })

      expect(envelopes).to.deep.eq([
        messages.Envelope.fromObject({
          stepDefinition: {
            id: '0',
            pattern: {
              source: '/I have (\\d+) cukes in my belly/',
              type:
                messages.StepDefinition.StepDefinitionPattern
                  .StepDefinitionPatternType.REGULAR_EXPRESSION,
            },
            sourceReference: {
              uri: 'features/support/cukes.js',
              location: {
                line: 9,
              },
            },
          },
        }),
      ])
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
              tags: '@hooks-tho',
            },
            uri: 'features/support/hooks.js',
          }),
        ],
        afterTestCaseHookDefinitions: [
          new TestCaseHookDefinition({
            code: noopFunction,
            unwrappedCode: noopFunction,
            id: '1',
            line: 7,
            options: {},
            uri: 'features/support/hooks.js',
          }),
          new TestCaseHookDefinition({
            code: noopFunction,
            unwrappedCode: noopFunction,
            id: '2',
            line: 11,
            options: {},
            uri: 'features/support/hooks.js',
          }),
        ],
      })

      expect(envelopes).to.deep.eq([
        messages.Envelope.fromObject({
          hook: {
            id: '0',
            tagExpression: '@hooks-tho',
            sourceReference: {
              uri: 'features/support/hooks.js',
              location: {
                line: 3,
              },
            },
          },
        }),
        messages.Envelope.fromObject({
          hook: {
            id: '1',
            sourceReference: {
              uri: 'features/support/hooks.js',
              location: {
                line: 7,
              },
            },
          },
        }),
        messages.Envelope.fromObject({
          hook: {
            id: '2',
            sourceReference: {
              uri: 'features/support/hooks.js',
              location: {
                line: 11,
              },
            },
          },
        }),
      ])
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
            uri: 'features/support/run-hooks.js',
          }),
        ],
        afterTestRunHookDefinitions: [
          new TestRunHookDefinition({
            code: noopFunction,
            unwrappedCode: noopFunction,
            id: '1',
            line: 7,
            options: {},
            uri: 'features/support/run-hooks.js',
          }),
          new TestRunHookDefinition({
            code: noopFunction,
            unwrappedCode: noopFunction,
            id: '2',
            line: 11,
            options: {},
            uri: 'features/support/run-hooks.js',
          }),
        ],
      })

      expect(envelopes).to.deep.eq([
        messages.Envelope.fromObject({
          hook: {
            id: '0',
            sourceReference: {
              uri: 'features/support/run-hooks.js',
              location: {
                line: 3,
              },
            },
          },
        }),
        messages.Envelope.fromObject({
          hook: {
            id: '1',
            sourceReference: {
              uri: 'features/support/run-hooks.js',
              location: {
                line: 7,
              },
            },
          },
        }),
        messages.Envelope.fromObject({
          hook: {
            id: '2',
            sourceReference: {
              uri: 'features/support/run-hooks.js',
              location: {
                line: 11,
              },
            },
          },
        }),
      ])
    })
    it('emits messages for test step level hooks', () => {
      const envelopes = testEmitSupportCodeMessages({
        beforeTestStepHookDefinitions: [
          new TestStepHookDefinition({
            code: noopFunction,
            unwrappedCode: noopFunction,
            id: '0',
            line: 3,
            options: {
              tags: '@hooks-tho',
            },
            uri: 'features/support/hooks.js',
          }),
        ],
        afterTestStepHookDefinitions: [
          new TestStepHookDefinition({
            code: noopFunction,
            unwrappedCode: noopFunction,
            id: '1',
            line: 7,
            options: {},
            uri: 'features/support/hooks.js',
          }),
          new TestStepHookDefinition({
            code: noopFunction,
            unwrappedCode: noopFunction,
            id: '2',
            line: 11,
            options: {},
            uri: 'features/support/hooks.js',
          }),
        ],
      })

      expect(envelopes).to.deep.eq([
        messages.Envelope.fromObject({
          hook: {
            id: '0',
            tagExpression: '@hooks-tho',
            sourceReference: {
              uri: 'features/support/hooks.js',
              location: {
                line: 3,
              },
            },
          },
        }),
        messages.Envelope.fromObject({
          hook: {
            id: '1',
            sourceReference: {
              uri: 'features/support/hooks.js',
              location: {
                line: 7,
              },
            },
          },
        }),
        messages.Envelope.fromObject({
          hook: {
            id: '2',
            sourceReference: {
              uri: 'features/support/hooks.js',
              location: {
                line: 11,
              },
            },
          },
        }),
      ])
    })
  })
  describe('parseGherkinMessageStream', () => {
    describe('empty feature', () => {
      it('emits source and gherkinDocument events and returns an empty array', async function () {
        // Arrange
        const cwd = '/project'
        const sourceEnvelope = messages.Envelope.create({
          source: messages.Source.fromObject({
            data: '',
            mediaType: 'text/x.cucumber.gherkin+plain',
            uri: '/project/features/a.feature',
          }),
        })
        const gherkinMessageStream = GherkinStreams.fromSources(
          [sourceEnvelope],
          {}
        )
        const order = 'defined'
        const pickleFilter = new PickleFilter({ cwd })

        // Act
        const { envelopes, result } = await testParseGherkinMessageStream({
          cwd,
          gherkinMessageStream,
          order,
          pickleFilter,
        })

        // Assert
        expect(result).to.eql([])
        expect(envelopes).to.have.lengthOf(2)
        expect(envelopes[0]).to.eql(sourceEnvelope)
        expect(envelopes[1].gherkinDocument).to.exist()
        expect(envelopes[1].gherkinDocument).to.have.keys(['comments', 'uri'])
      })
    })

    describe('feature with scenario that does not match the filter', () => {
      it('emits pickle event and returns an empty array', async function () {
        // Arrange
        const cwd = '/project'
        const sourceEnvelope = messages.Envelope.create({
          source: messages.Source.fromObject({
            data: '@tagA\nFeature: a\nScenario: b\nGiven a step',
            mediaType: 'text/x.cucumber.gherkin+plain',
            uri: '/project/features/a.feature',
          }),
        })
        const gherkinMessageStream = GherkinStreams.fromSources(
          [sourceEnvelope],
          {}
        )
        const order = 'defined'
        const pickleFilter = new PickleFilter({
          cwd,
          tagExpression: 'not @tagA',
        })

        // Act
        const { envelopes, result } = await testParseGherkinMessageStream({
          cwd,
          gherkinMessageStream,
          order,
          pickleFilter,
        })

        // Assert
        expect(result).to.eql([])
        expect(envelopes).to.have.lengthOf(3)
        expect(envelopes[0]).to.eql(sourceEnvelope)
        expect(envelopes[1].gherkinDocument).to.exist()
        expect(envelopes[2].pickle).to.exist()
        expect(envelopes[2].pickle).to.have.keys([
          'astNodeIds',
          'id',
          'language',
          'name',
          'steps',
          'tags',
          'uri',
        ])
      })
    })

    describe('feature with scenario that matches the filter', () => {
      it('emits pickle and returns the pickleId', async function () {
        // Arrange
        const cwd = '/project'
        const sourceEnvelope = messages.Envelope.create({
          source: messages.Source.fromObject({
            data: 'Feature: a\nScenario: b\nGiven a step',
            mediaType: 'text/x.cucumber.gherkin+plain',
            uri: '/project/features/a.feature',
          }),
        })
        const gherkinMessageStream = GherkinStreams.fromSources(
          [sourceEnvelope],
          {}
        )
        const order = 'defined'
        const pickleFilter = new PickleFilter({ cwd })

        // Act
        const { envelopes, result } = await testParseGherkinMessageStream({
          cwd,
          gherkinMessageStream,
          order,
          pickleFilter,
        })

        // Assert
        expect(result).to.eql([envelopes[2].pickle.id])
        expect(envelopes).to.have.lengthOf(3)
        expect(envelopes[0]).to.eql(sourceEnvelope)
        expect(envelopes[1].gherkinDocument).to.exist()
        expect(envelopes[2].pickle).to.exist()
      })
    })
  })
})
