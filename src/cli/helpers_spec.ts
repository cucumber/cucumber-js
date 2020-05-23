import { describe, it } from 'mocha'
import { expect } from 'chai'
import { emitSupportCodeMessages, parseGherkinMessageStream } from './helpers'
import { EventEmitter } from 'events'
import PickleFilter from '../pickle_filter'
import { messages } from '@cucumber/messages'
import { EventDataCollector } from '../formatter/helpers'
import { GherkinStreams } from '@cucumber/gherkin'
import { Readable } from 'stream'
import StepDefinition from '../models/step_definition'
import {
  CucumberExpression,
  ParameterTypeRegistry,
  RegularExpression,
} from 'cucumber-expressions'

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
  eventBroadcaster.on('envelope', e => envelopes.push(e))
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
  stepDefinitions: StepDefinition[]
): messages.IEnvelope[] {
  const envelopes: messages.IEnvelope[] = []
  const eventBroadcaster = new EventEmitter()
  eventBroadcaster.on('envelope', e => envelopes.push(e))
  emitSupportCodeMessages({
    eventBroadcaster,
    stepDefinitions,
  })
  return envelopes
}

describe('helpers', () => {
  describe('emitSupportCodeMessages', () => {
    it('emits messages for step definitions using cucumber expressions', () => {
      const envelopes = testEmitSupportCodeMessages([
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
      ])

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
      const envelopes = testEmitSupportCodeMessages([
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
      ])

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
  })
  describe('parseGherkinMessageStream', () => {
    describe('empty feature', () => {
      it('emits source and gherkinDocument events and returns an empty array', async function() {
        // Arrange
        const cwd = '/project'
        const sourceEnvelope = messages.Envelope.create({
          source: {
            data: '',
            mediaType: 'text/x.cucumber.gherkin+plain',
            uri: '/project/features/a.feature',
          },
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
      it('emits pickle and pickleRejected events and returns an empty array', async function() {
        // Arrange
        const cwd = '/project'
        const sourceEnvelope = messages.Envelope.create({
          source: {
            data: '@tagA\nFeature: a\nScenario: b\nGiven a step',
            mediaType: 'text/x.cucumber.gherkin+plain',
            uri: '/project/features/a.feature',
          },
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
        expect(envelopes).to.have.lengthOf(4)
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
      it('emits pickleAccepted and returns the pickleId', async function() {
        // Arrange
        const cwd = '/project'
        const sourceEnvelope = messages.Envelope.create({
          source: {
            data: 'Feature: a\nScenario: b\nGiven a step',
            mediaType: 'text/x.cucumber.gherkin+plain',
            uri: '/project/features/a.feature',
          },
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
        expect(envelopes).to.have.lengthOf(4)
        expect(envelopes[0]).to.eql(sourceEnvelope)
        expect(envelopes[1].gherkinDocument).to.exist()
        expect(envelopes[2].pickle).to.exist()
      })
    })
  })
})
