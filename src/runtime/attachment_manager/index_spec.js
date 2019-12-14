import { beforeEach, describe, it } from 'mocha'
import { expect } from 'chai'
import sinon from 'sinon'
import AttachmentManager from './'
import stream from 'stream'
import { messages } from 'cucumber-messages'

describe('AttachmentManager', () => {
  describe('create()', () => {
    beforeEach(function() {
      this.onAttachment = sinon.stub()
      this.attachmentManager = new AttachmentManager(this.onAttachment)
    })

    describe('buffer', () => {
      describe('with mime type', () => {
        beforeEach(function() {
          this.attachmentManager.create(
            Buffer.from('my string'),
            'text/special'
          )
        })

        it('adds the data and media', function() {
          expect(this.onAttachment).to.have.callCount(1)
          const attachment = this.onAttachment.firstCall.args[0]
          const encodedData = attachment.data
          expect(encodedData).to.eql('bXkgc3RyaW5n')
          const decodedData = Buffer.from(encodedData, 'base64').toString()
          expect(decodedData).to.eql('my string')
          expect(attachment.media.contentType).to.eql('text/special')
          expect(attachment.media.encoding).to.eql(
            messages.Media.Encoding.BASE64
          )
        })
      })

      describe('without media type', () => {
        it('throws', function() {
          expect(() => {
            this.attachmentManager.create(Buffer.from('my string'))
          }).to.throw('Buffer attachments must specify a media type')
        })
      })
    })

    describe('readable stream', () => {
      describe('with mime type', () => {
        describe('with callback', () => {
          beforeEach(function(done) {
            const readableStream = new stream.PassThrough()
            this.result = this.attachmentManager.create(
              readableStream,
              'text/special',
              done
            )
            setTimeout(() => {
              readableStream.write('my string')
              readableStream.end()
            }, 25)
          })

          it('does not return a promise', function() {
            expect(this.result).to.eql(undefined)
          })

          it('adds the data and media', function() {
            expect(this.onAttachment).to.have.callCount(1)
            const attachment = this.onAttachment.firstCall.args[0]
            const encodedData = attachment.data
            expect(encodedData).to.eql('bXkgc3RyaW5n')
            const decodedData = Buffer.from(encodedData, 'base64').toString()
            expect(decodedData).to.eql('my string')
            expect(attachment.media.contentType).to.eql('text/special')
            expect(attachment.media.encoding).to.eql(
              messages.Media.Encoding.BASE64
            )
          })
        })

        describe('without callback', () => {
          beforeEach(function() {
            const readableStream = new stream.PassThrough()
            this.result = this.attachmentManager.create(
              readableStream,
              'text/special'
            )
            setTimeout(() => {
              readableStream.write('my string')
              readableStream.end()
            }, 25)
            return this.result
          })

          it('returns a promise', function() {
            expect(this.result.then).to.be.a('function')
          })

          it('adds the data and media', function() {
            expect(this.onAttachment).to.have.callCount(1)
            const attachment = this.onAttachment.firstCall.args[0]
            const encodedData = attachment.data
            expect(encodedData).to.eql('bXkgc3RyaW5n')
            const decodedData = Buffer.from(encodedData, 'base64').toString()
            expect(decodedData).to.eql('my string')
            expect(attachment.media.contentType).to.eql('text/special')
            expect(attachment.media.encoding).to.eql(
              messages.Media.Encoding.BASE64
            )
          })
        })
      })

      describe('without media type', () => {
        it('throws', function() {
          expect(() => {
            const readableStream = new stream.PassThrough()
            this.attachmentManager.create(readableStream)
          }).to.throw('Stream attachments must specify a media type')
        })
      })
    })

    describe('string', () => {
      describe('with media type', () => {
        beforeEach(function() {
          this.attachmentManager.create('my string', 'text/special')
        })

        it('adds the data and media', function() {
          expect(this.onAttachment).to.have.callCount(1)
          const attachment = this.onAttachment.firstCall.args[0]
          expect(attachment.data).to.eql('my string')
          expect(attachment.media.contentType).to.eql('text/special')
          expect(attachment.media.encoding).to.eql(messages.Media.Encoding.UTF8)
        })
      })

      describe('without mime type', () => {
        beforeEach(function() {
          this.attachmentManager.create('my string')
        })

        it('adds the data with the default mime type', function() {
          expect(this.onAttachment).to.have.callCount(1)
          const attachment = this.onAttachment.firstCall.args[0]
          expect(attachment.data).to.eql('my string')
          expect(attachment.media.contentType).to.eql('text/plain')
          expect(attachment.media.encoding).to.eql(messages.Media.Encoding.UTF8)
        })
      })
    })

    describe('unsupported data type', () => {
      it('throws', function() {
        expect(() => {
          this.attachmentManager.create({}, 'object/special')
        }).to.throw(
          'Invalid attachment data: must be a buffer, readable stream, or string'
        )
      })
    })
  })
})
