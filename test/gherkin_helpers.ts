import type { EventEmitter } from 'node:events'
import type { IGherkinOptions } from '@cucumber/gherkin'
import { GherkinStreams } from '@cucumber/gherkin-streams'
import {
  type Envelope,
  type GherkinDocument,
  type Pickle,
  type PickleStep,
  type Source,
  SourceMediaType,
} from '@cucumber/messages'
import type { SourcedPickle } from '../src/assemble'
import { doesHaveValue } from '../src/value_checker'

export interface IParsedSource {
  pickles: Pickle[]
  source: Source
  gherkinDocument: GherkinDocument
}

export interface IParsedSourceWithEnvelopes extends IParsedSource {
  envelopes: Envelope[]
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
  const sources: Envelope[] = [
    {
      source: {
        uri,
        data: data,
        mediaType: SourceMediaType.TEXT_X_CUCUMBER_GHERKIN_PLAIN,
      },
    },
  ]
  return await new Promise<IParsedSourceWithEnvelopes>((resolve, reject) => {
    let source: Source
    let gherkinDocument: GherkinDocument
    const pickles: Pickle[] = []
    const envelopes: Envelope[] = []
    const messageStream = GherkinStreams.fromSources(sources, options)
    messageStream.on('data', (envelope: Envelope) => {
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
        reject(new Error(`Parse error in '${uri}': ${envelope.attachment.body}`))
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

export interface GeneratePicklesRequest {
  data: string
  eventBroadcaster: EventEmitter
  uri: string
}

export async function generatePickles({
  data,
  eventBroadcaster,
  uri,
}: GeneratePicklesRequest): Promise<ReadonlyArray<SourcedPickle>> {
  const { envelopes, gherkinDocument, pickles } = await parse({
    data,
    uri,
  })
  for (const envelope of envelopes) {
    eventBroadcaster.emit('envelope', envelope)
  }
  return pickles.map((pickle) => {
    return {
      gherkinDocument,
      pickle,
    }
  })
}

export async function getPickleWithTags(tags: string[]): Promise<Pickle> {
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

export async function getPickleStepWithText(text: string): Promise<PickleStep> {
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
