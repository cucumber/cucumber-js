import { Readable } from 'node:stream'
import isStream from 'is-stream'
import * as messages from '@cucumber/messages'
import { doesHaveValue, doesNotHaveValue } from '../../value_checker'

export interface IAttachmentMedia {
  encoding: messages.AttachmentContentEncoding
  contentType: string
}

export interface IAttachment {
  data: string
  media: IAttachmentMedia
  fileName?: string
}

export type IAttachFunction = (attachment: IAttachment) => void

export interface ICreateAttachmentOptions {
  mediaType: string
  fileName?: string
}
export type ICreateStringAttachment = (
  data: string,
  mediaTypeOrOptions?: string | ICreateAttachmentOptions
) => void
export type ICreateBufferAttachment = (
  data: Buffer,
  mediaTypeOrOptions: string | ICreateAttachmentOptions
) => void
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
    const options = normaliseOptions(mediaTypeOrOptions)
    if (Buffer.isBuffer(data)) {
      if (doesNotHaveValue(options.mediaType)) {
        throw Error('Buffer attachments must specify a media type')
      }
      this.createBufferAttachment(data, options.mediaType, options.fileName)
    } else if (isStream.readable(data)) {
      if (doesNotHaveValue(options.mediaType)) {
        throw Error('Stream attachments must specify a media type')
      }
      return this.createStreamAttachment(
        data,
        options.mediaType,
        options.fileName,
        callback
      )
    } else if (typeof data === 'string') {
      if (doesNotHaveValue(options.mediaType)) {
        options.mediaType = 'text/plain'
      }
      if (options.mediaType.startsWith('base64:')) {
        this.createStringAttachment(
          data,
          {
            encoding: messages.AttachmentContentEncoding.BASE64,
            contentType: options.mediaType.replace('base64:', ''),
          },
          options.fileName
        )
      } else {
        this.createStringAttachment(
          data,
          {
            encoding: messages.AttachmentContentEncoding.IDENTITY,
            contentType: options.mediaType,
          },
          options.fileName
        )
      }
    } else {
      throw Error(
        'Invalid attachment data: must be a buffer, readable stream, or string'
      )
    }
  }

  createBufferAttachment(
    data: Buffer,
    mediaType: string,
    fileName?: string
  ): void {
    this.createStringAttachment(
      data.toString('base64'),
      {
        encoding: messages.AttachmentContentEncoding.BASE64,
        contentType: mediaType,
      },
      fileName
    )
  }

  createStreamAttachment(
    data: Readable,
    mediaType: string,
    fileName?: string,
    callback?: () => void
  ): void | Promise<void> {
    const promise = new Promise<void>((resolve, reject) => {
      const buffers: Uint8Array[] = []
      data.on('data', (chunk) => {
        buffers.push(chunk)
      })
      data.on('end', () => {
        this.createBufferAttachment(Buffer.concat(buffers), mediaType, fileName)
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

  createStringAttachment(
    data: string,
    media: IAttachmentMedia,
    fileName?: string
  ): void {
    this.onAttachment({
      data,
      media,
      ...(fileName ? { fileName } : {}),
    })
  }
}

function normaliseOptions(
  mediaTypeOrOptions?: string | ICreateAttachmentOptions
): Partial<ICreateAttachmentOptions> {
  if (!mediaTypeOrOptions) {
    return {}
  }
  if (typeof mediaTypeOrOptions === 'string') {
    return {
      mediaType: mediaTypeOrOptions,
    }
  }
  return mediaTypeOrOptions
}
