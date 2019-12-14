import isStream from 'is-stream'
import Promise from 'bluebird'
import { messages } from 'cucumber-messages'

export default class AttachmentManager {
  constructor(onAttachment) {
    this.onAttachment = onAttachment
  }

  create(data, mediaType, callback) {
    if (Buffer.isBuffer(data)) {
      if (!mediaType) {
        throw Error('Buffer attachments must specify a media type')
      }
      this.createBufferAttachment(data, mediaType)
    } else if (isStream.readable(data)) {
      if (!mediaType) {
        throw Error('Stream attachments must specify a media type')
      }
      return this.createStreamAttachment(data, mediaType, callback)
    } else if (typeof data === 'string') {
      if (!mediaType) {
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

  createBufferAttachment(data, mediaType) {
    this.createStringAttachment(
      data.toString('base64'),
      messages.Media.fromObject({
        encoding: messages.Media.Encoding.BASE64,
        contentType: mediaType,
      })
    )
  }

  createStreamAttachment(data, mediaType, callback) {
    const promise = new Promise((resolve, reject) => {
      const buffers = []
      data.on('data', chunk => {
        buffers.push(chunk)
      })
      data.on('end', () => {
        this.createBufferAttachment(Buffer.concat(buffers), mediaType)
        resolve()
      })
      data.on('error', reject)
    })
    if (callback) {
      promise.then(callback, callback)
    } else {
      return promise
    }
  }

  createStringAttachment(data, media) {
    this.onAttachment({ data, media })
  }
}
