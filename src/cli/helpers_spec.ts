import { describe, it } from 'mocha'
import { expect } from 'chai'
import { parseGherkinMessageStream } from './helpers'
import EventEmitter from 'events'
import PickleFilter from '../pickle_filter'
import { messages } from 'cucumber-messages'
import { EventDataCollector } from '../formatter/helpers'
import Gherkin from 'gherkin'
import { Readable } from 'stream'

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

describe('helpers', () => {
  describe('parseGherkinMessageStream', () => {
    describe('empty feature', () => {
      it('emits source and gherkinDocument events and returns an empty array', async function() {
        // Arrange
        const cwd = '/project'
        const sourceEnvelope = messages.Envelope.create({
          source: {
            data: '',
            media: {
              contentType: 'text/x.cucumber.gherkin+plain',
              encoding: messages.Media.Encoding.UTF8,
            },
            uri: '/project/features/a.feature',
          },
        })
        const gherkinMessageStream = Gherkin.fromSources([sourceEnvelope])
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
            media: {
              contentType: 'text/x.cucumber.gherkin+plain',
              encoding: messages.Media.Encoding.UTF8,
            },
            uri: '/project/features/a.feature',
          },
        })
        const gherkinMessageStream = Gherkin.fromSources([sourceEnvelope])
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
        expect(envelopes[3].pickleRejected).to.exist()
        expect(envelopes[3].pickleRejected.pickleId).to.eql(
          envelopes[2].pickle.id
        )
      })
    })

    describe('feature with scenario that matches the filter', () => {
      it('emits pickleAccepted and returns the pickleId', async function() {
        // Arrange
        const cwd = '/project'
        const sourceEnvelope = messages.Envelope.create({
          source: {
            data: 'Feature: a\nScenario: b\nGiven a step',
            media: {
              contentType: 'text/x.cucumber.gherkin+plain',
              encoding: messages.Media.Encoding.UTF8,
            },
            uri: '/project/features/a.feature',
          },
        })
        const gherkinMessageStream = Gherkin.fromSources([sourceEnvelope])
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
        expect(envelopes[3].pickleAccepted).to.exist()
        expect(envelopes[3].pickleAccepted.pickleId).to.eql(
          envelopes[2].pickle.id
        )
      })
    })
  })
})
