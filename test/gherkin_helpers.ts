import { messages } from '@cucumber/messages'
import { doesHaveValue } from '../src/value_checker'
import { GherkinStreams, IGherkinOptions } from '@cucumber/gherkin'
import { EventEmitter } from 'events'

export interface IParsedSource {
  pickles: messages.IPickle[]
  source: messages.ISource
  gherkinDocument: messages.IGherkinDocument
}

export interface IParsedSourceWithEnvelopes extends IParsedSource {
  envelopes: messages.IEnvelope[]
}

export interface IParseRequest {
  data: string
  uri: string
  options?: IGherkinOptions
}

export async function parse({
  data,
  uri,
  options,
}: IParseRequest): Promise<IParsedSourceWithEnvelopes> {
  const sources = [
    {
      source: {
        uri,
        data: data,
        mediaType: 'text/x.cucumber.gherkin+plain',
      },
    },
  ]
  return await new Promise<IParsedSourceWithEnvelopes>((resolve, reject) => {
    let source: messages.ISource
    let gherkinDocument: messages.IGherkinDocument
    const pickles: messages.IPickle[] = []
    const envelopes: messages.IEnvelope[] = []
    const messageStream = GherkinStreams.fromSources(sources, options)
    messageStream.on('data', (envelope: messages.IEnvelope) => {
      envelopes.push(envelope)
      if (doesHaveValue(envelope.source)) {
        source = envelope.source
      }
      if (doesHaveValue(envelope.gherkinDocument)) {
        gherkinDocument = envelope.gherkinDocument
      }
      if (doesHaveValue(envelope.pickle)) {
        pickles.push(envelope.pickle)
      }
      if (doesHaveValue(envelope.attachment)) {
        reject(
          new Error(`Parse error in '${uri}': ${envelope.attachment.body}`)
        )
      }
    })
    messageStream.on('end', () => {
      resolve({
        envelopes,
        source,
        gherkinDocument,
        pickles,
      })
    })
    messageStream.on('error', reject)
  })
}

export interface IGenerateEventsRequest {
  data: string
  eventBroadcaster: EventEmitter
  uri: string
}

export async function generateEvents({
  data,
  eventBroadcaster,
  uri,
}: IGenerateEventsRequest): Promise<IParsedSource> {
  const { envelopes, source, gherkinDocument, pickles } = await parse({
    data,
    uri,
  })
  envelopes.forEach((envelope) => eventBroadcaster.emit('envelope', envelope))
  return { source, gherkinDocument, pickles }
}

export async function getPickleWithTags(
  tags: string[]
): Promise<messages.IPickle> {
  const {
    pickles: [pickle],
  } = await parse({
    data: `\
Feature: a
  ${tags.join(' ')} 
  Scenario: b
    Given a step
`,
    uri: 'a.feature',
  })
  return pickle
}

export async function getPickleStepWithText(
  text: string
): Promise<messages.IPickle> {
  const {
    pickles: [pickle],
  } = await parse({
    data: `\
Feature: a
  Scenario: b
    ${text}
`,
    uri: 'a.feature',
  })
  return pickle.steps[0]
}
