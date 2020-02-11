import Gherkin from 'gherkin'
import { messages } from 'cucumber-messages'
import { doesHaveValue } from '../src/value_checker'

export interface IParsedSource {
  pickles: messages.IPickle[]
  source: messages.ISource
  gherkinDocument: messages.IGherkinDocument
}

export interface IParsedSourceWithEnvelopes extends IParsedSource {
  envelopes: messages.IEnvelope[]
}

export async function parse({
  data,
  uri,
}): Promise<IParsedSourceWithEnvelopes> {
  const sources = [
    {
      source: {
        uri,
        data: data,
        media: {
          encoding: messages.Media.Encoding.UTF8,
          contentType: 'text/x.cucumber.gherkin+plain',
        },
      },
    },
  ]
  return new Promise<IParsedSourceWithEnvelopes>((resolve, reject) => {
    let source: messages.ISource
    let gherkinDocument: messages.IGherkinDocument
    const pickles: messages.IPickle[] = []
    const envelopes: messages.IEnvelope[] = []
    const messageStream = Gherkin.fromSources(sources)
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
        envelopes.push(
          messages.Envelope.fromObject({
            pickleAccepted: { pickleId: envelope.pickle.id },
          })
        )
      }
      if (doesHaveValue(envelope.attachment)) {
        reject(
          new Error(`Parse error in '${uri}': ${envelope.attachment.data}`)
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

export async function generateEvents({
  data,
  eventBroadcaster,
  uri,
}): Promise<IParsedSource> {
  const { envelopes, source, gherkinDocument, pickles } = await parse({
    data,
    uri,
  })
  envelopes.forEach(envelope => eventBroadcaster.emit('envelope', envelope))
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
