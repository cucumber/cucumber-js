import isStream from 'is-stream'
import { Readable } from 'stream'
import * as messages from '@cucumber/messages'
import { doesHaveValue, doesNotHaveValue } from '../../value_checker'

export interface IAttachmentMedia {
  encoding: messages.AttachmentContentEncoding
  contentType: string
}

export interface IAttachment {
  data: string
  media: IAttachmentMedia
}

export type IAttachFunction = (attachment: IAttachment) => void

export interface ICreateAttachmentOptions {
  mediaType: string
  fileName?: string
}
export type ICreateStringAttachment = (data: string, mediaTypeOrOptions?: string | ICreateAttachmentOptions) => void
export type ICreateBufferAttachment = (data: Buffer, mediaTypeOrOptions: string | ICreateAttachmentOptions) => void
export type ICreateStreamAttachment = (
  data: Readable,
  mediaTypeOrOptions: string | ICreateAttachmentOptions
) => Promise<void>
export type ICreateStreamAttachmentWithCallback = (
  data: Readable,
  mediaTypeOrOptions: string | ICreateAttachmentOptions,
  callback: () => void
) => void
export type ICreateAttachment = ICreateStringAttachment &
  ICreateBufferAttachment &
  ICreateStreamAttachment &
  ICreateStreamAttachmentWithCallback
export type ICreateLog = (text: string) => void

export default class AttachmentManager {
  private readonly onAttachment: IAttachFunction

  constructor(onAttachment: IAttachFunction) {
    this.onAttachment = onAttachment
  }

  log(text: string): void | Promise<void> {
    return this.create(text, 'text/x.cucumber.log+plain')
  }

  create(
    data: Buffer | Readable | string,
    mediaTypeOrOptions?: string | ICreateAttachmentOptions,
    callback?: () => void
  ): void | Promise<void> {
    if (Buffer.isBuffer(data)) {
      if (doesNotHaveValue(mediaTypeOrOptions)) {
        throw Error('Buffer attachments must specify a media type')
      }
      this.createBufferAttachment(data, mediaTypeOrOptions)
    } else if (isStream.readable(data)) {
      if (doesNotHaveValue(mediaTypeOrOptions)) {
        throw Error('Stream attachments must specify a media type')
      }
      return this.createStreamAttachment(data, mediaTypeOrOptions, callback)
    } else if (typeof data === 'string') {
      if (doesNotHaveValue(mediaTypeOrOptions)) {
        mediaTypeOrOptions = 'text/plain'
      }
      if (mediaTypeOrOptions.startsWith('base64:')) {
        this.createStringAttachment(data, {
          encoding: messages.AttachmentContentEncoding.BASE64,
          contentType: mediaTypeOrOptions.replace('base64:', ''),
        })
      } else {
        this.createStringAttachment(data, {
          encoding: messages.AttachmentContentEncoding.IDENTITY,
          contentType: mediaTypeOrOptions,
        })
      }
    } else {
      throw Error(
        'Invalid attachment data: must be a buffer, readable stream, or string'
      )
    }
  }

  createBufferAttachment(data: Buffer, mediaType: string): void {
    this.createStringAttachment(data.toString('base64'), {
      encoding: messages.AttachmentContentEncoding.BASE64,
      contentType: mediaType,
    })
  }

  createStreamAttachment(
    data: Readable,
    mediaType: string,
    callback: () => void
  ): void | Promise<void> {
    const promise = new Promise<void>((resolve, reject) => {
      const buffers: Uint8Array[] = []
      data.on('data', (chunk) => {
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

  createStringAttachment(data: string, media: IAttachmentMedia): void {
    this.onAttachment({ data, media })
  }
}
