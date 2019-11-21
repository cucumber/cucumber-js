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
      }
    },
  ]
  return new Promise((resolve, reject) => {
    let source
    let gherkinDocument
    let pickle
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
        pickle = envelope.pickle
        envelopes.push(messages.Envelope.fromObject({pickleAccepted: {pickleId: pickle.id}}))
      }
      if (envelope.attachment) {
        reject(
          new Error(
            `Parse error in '${path.relative(
              cwd,
              envelope.attachment.source.uri
            )}': ${envelope.attachment.data}`
          )
        )
      }
    })
    messageStream.on('end', () => {
      resolve({
        envelopes,
        source,
        gherkinDocument,
        pickle,
      })
    })
    messageStream.on('error', reject)
  })
}

export async function generateEvents({ data, eventBroadcaster, uri }) {
  const { envelopes, source, gherkinDocument, pickle } = await parse({ data, uri })
  envelopes.forEach((envelope) => eventBroadcaster.emit('envelope', envelope))
  return { source, gherkinDocument, pickle }
}
