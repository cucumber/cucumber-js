import { fromSources as gherkinFromSources } from 'gherkin'
import { messages } from 'cucumber-messages'

export function parse({ data, uri }) {
  const sources = [
    {
      uri,
      data: data,
      media: {
        encoding: messages.Media.Encoding.UTF8,
        contentType: 'text/x.cucumber.gherkin+plain',
      },
    },
  ]
  return new Promise((resolve, reject) => {
    let source
    let gherkinDocument
    let pickle
    const messageStream = gherkinFromSources(sources)
    messageStream.on('data', envelope => {
      if (envelope.source) {
        source = envelope.source
      }
      if (envelope.gherkinDocument) {
        gherkinDocument = envelope.gherkinDocument
      }
      if (envelope.pickle) {
        pickle = envelope.pickle
      }
    })
    messageStream.on('end', () => {
      resolve({
        source,
        gherkinDocument,
        pickle,
      })
    })
    messageStream.on('error', reject)
  })
}

export async function generateEvents({ data, eventBroadcaster, uri }) {
  const { source, gherkinDocument, pickle } = await parse({ data, uri })
  eventBroadcaster.emit('source', source)
  eventBroadcaster.emit('gherkin-document', gherkinDocument)
  eventBroadcaster.emit('pickle', pickle)
  eventBroadcaster.emit('pickle-accepted', pickle)
}
