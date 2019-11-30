import { fromSources as gherkinFromSources } from 'gherkin'
import { messages } from 'cucumber-messages'

export function parse({ data, uri }) {
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
  return new Promise((resolve, reject) => {
    let source
    let gherkinDocument
    const pickles = []
    const envelopes = []
    const messageStream = gherkinFromSources(sources)
    messageStream.on('data', envelope => {
      envelopes.push(envelope)
      if (envelope.source) {
        source = envelope.source
      }
      if (envelope.gherkinDocument) {
        gherkinDocument = envelope.gherkinDocument
      }
      if (envelope.pickle) {
        pickles.push(envelope.pickle)
        envelopes.push(
          messages.Envelope.fromObject({
            pickleAccepted: { pickleId: envelope.pickle.id },
          })
        )
      }
      if (envelope.attachment) {
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

export async function generateEvents({ data, eventBroadcaster, uri }) {
  const { envelopes, source, gherkinDocument, pickles } = await parse({
    data,
    uri,
  })
  envelopes.forEach(envelope => eventBroadcaster.emit('envelope', envelope))
  return { source, gherkinDocument, pickles }
}
