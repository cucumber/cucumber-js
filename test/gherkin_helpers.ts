import * as messages from '@cucumber/messages'
import { SourceMediaType } from '@cucumber/messages'
import { doesHaveValue } from '../src/value_checker'
import { IGherkinOptions } from '@cucumber/gherkin'
import { GherkinStreams } from '@cucumber/gherkin-streams'
import { EventEmitter } from 'events'

export interface IParsedSource {
  pickles: messages.Pickle[]
  source: messages.Source
  gherkinDocument: messages.GherkinDocument
}

export interface IParsedSourceWithEnvelopes extends IParsedSource {
  envelopes: messages.Envelope[]
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
  const sources: messages.Envelope[] = [
    {
      source: {
        uri,
        data: data,
        mediaType: SourceMediaType.TEXT_X_CUCUMBER_GHERKIN_PLAIN,
      },
    },
  ]
  return await new Promise<IParsedSourceWithEnvelopes>((resolve, reject) => {
    let source: messages.Source
    let gherkinDocument: messages.GherkinDocument
    const pickles: messages.Pickle[] = []
    const envelopes: messages.Envelope[] = []
    const messageStream = GherkinStreams.fromSources(sources, options)
    messageStream.on('data', (envelope: messages.Envelope) => {
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
): Promise<messages.Pickle> {
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
): Promise<messages.PickleStep> {
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
