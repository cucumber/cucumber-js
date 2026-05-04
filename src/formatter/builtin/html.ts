import { promisify } from 'node:util'
import { finished } from 'node:stream'
import { CucumberHtmlStream } from '@cucumber/html-formatter'
import { AttachmentExternalisingStream } from '@cucumber/message-streams'
import { FormatterPlugin } from '../../plugin'

interface Options {
  externalAttachments?: boolean | ReadonlyArray<string>
}

export default {
  type: 'formatter',
  formatter({ on, options, write, directory }) {
    if (!directory && options.externalAttachments) {
      throw new Error(
        'Unable to externalise attachments when formatter is not writing to a file'
      )
    }
    const externaliseStream = new AttachmentExternalisingStream({
      behaviour: options.externalAttachments,
      directory,
    })
    const htmlStream = new CucumberHtmlStream()
    externaliseStream.pipe(htmlStream)
    on('message', (message) => {
      externaliseStream.write(message)
    })
    htmlStream.on('data', (chunk) => write(chunk))

    return async () => {
      externaliseStream.end()
      await promisify(finished)(htmlStream)
    }
  },
  optionsKey: 'html',
} satisfies FormatterPlugin<Options>
