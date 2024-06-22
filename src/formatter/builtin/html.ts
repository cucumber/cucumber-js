import { promisify } from 'node:util'
import { finished } from 'node:stream'
import { writeFile } from 'node:fs'
import path from 'node:path'
import CucumberHtmlStream from '@cucumber/html-formatter'
import resolvePkg from 'resolve-pkg'
import mimeTypes from 'mime'
import {
  Attachment,
  AttachmentContentEncoding,
  Envelope,
  IdGenerator,
} from '@cucumber/messages'
import { FormatterPlugin } from '../../plugin'

interface Options {
  externalAttachments?: true
}

export default {
  type: 'formatter',
  formatter({ on, options, write, directory }) {
    const newId = IdGenerator.uuid()
    const htmlStream = new CucumberHtmlStream(
      resolvePkg('@cucumber/html-formatter', { cwd: __dirname }) +
        '/dist/main.css',
      resolvePkg('@cucumber/html-formatter', { cwd: __dirname }) +
        '/dist/main.js'
    )
    const writeOperations: Promise<void>[] = []
    on('message', (message) => {
      if (message.attachment && options.externalAttachments) {
        const { attachment, writeOperation } = externaliseAttachment(
          newId,
          message.attachment,
          directory
        )
        htmlStream.write({
          ...message,
          attachment,
        } satisfies Envelope)
        if (writeOperation) {
          writeOperations.push(writeOperation)
        }
      } else {
        htmlStream.write(message)
      }
    })
    htmlStream.on('data', (chunk) => write(chunk))

    return async () => {
      htmlStream.end()
      await promisify(finished)(htmlStream)
      await Promise.all(writeOperations)
    }
  },
  documentation: 'Outputs a HTML report',
  optionsKey: 'html',
} satisfies FormatterPlugin<Options>

const encodingsMap = {
  IDENTITY: 'utf-8',
  BASE64: 'base64',
} as const

function externaliseAttachment(
  newId: () => string,
  original: Attachment,
  directory?: string
) {
  if (!directory) {
    return { attachment: original }
  }
  if (original.mediaType === 'text/x.cucumber.log+plain') {
    return { attachment: original }
  }
  let filename = `attachment-${newId()}`
  const extension = mimeTypes.getExtension(original.mediaType)
  if (extension) {
    filename += `.${extension}`
  }
  const writeOperation = promisify(writeFile)(
    path.join(directory, filename),
    Buffer.from(original.body, encodingsMap[original.contentEncoding])
  )
  const updated: Attachment = {
    ...original,
    contentEncoding: AttachmentContentEncoding.IDENTITY,
    body: '',
    url: `./${filename}`,
  }
  return {
    attachment: updated,
    writeOperation,
  }
}
