import isStream from 'is-stream'
import stream from 'stream'
import { messages } from 'cucumber-messages'
import { doesNotHaveValue, doesHaveValue } from '../../value_checker'

export interface IAttachment {
  data: string
  media: messages.Media
}

export type IAttachFunction = (attachment: IAttachment) => void
export type ICreateAttachment = (
  data: Buffer | stream.Readable | string,
  mediaType?: string,
  callback?: () => void
) => void | Promise<void>

export default class AttachmentManager {
  private readonly onAttachment: IAttachFunction

  constructor(onAttachment: IAttachFunction) {
    this.onAttachment = onAttachment
  }

  create(
    data: Buffer | stream.Readable | string,
    mediaType?: string,
    callback?: () => void
  ): void | Promise<void> {
    if (Buffer.isBuffer(data)) {
      if (doesNotHaveValue(mediaType)) {
        throw Error('Buffer attachments must specify a media type')
      }
      this.createBufferAttachment(data, mediaType)
    } else if (isStream.readable(data)) {
      if (doesNotHaveValue(mediaType)) {
        throw Error('Stream attachments must specify a media type')
      }
      return this.createStreamAttachment(data, mediaType, callback)
    } else if (typeof data === 'string') {
      if (doesNotHaveValue(mediaType)) {
        mediaType = 'text/plain'
      }
      this.createStringAttachment(
        data,
        messages.Media.fromObject({
          encoding: messages.Media.Encoding.UTF8,
          contentType: mediaType,
        })
      )
    } else {
      throw Error(
        'Invalid attachment data: must be a buffer, readable stream, or string'
      )
    }
  }

  createBufferAttachment(data: Buffer, mediaType: string): void {
    this.createStringAttachment(
      data.toString('base64'),
      messages.Media.fromObject({
        encoding: messages.Media.Encoding.BASE64,
        contentType: mediaType,
      })
    )
  }

  createStreamAttachment(
    data: stream.Readable,
    mediaType: string,
    callback: () => void
  ): void | Promise<void> {
    const promise = new Promise<void>((resolve, reject) => {
      const buffers: Uint8Array[] = []
      data.on('data', chunk => {
        buffers.push(chunk)
      })
      data.on('end', () => {
        this.createBufferAttachment(Buffer.concat(buffers), mediaType)
        resolve()
      })
      data.on('error', reject)
    })
    if (doesHaveValue(callback)) {
      promise.then(callback, callback)
    } else {
      return promise
    }
  }

  createStringAttachment(data: string, media: messages.Media): void {
    this.onAttachment({ data, media })
  }
}
