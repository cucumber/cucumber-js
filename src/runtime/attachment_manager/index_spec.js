import AttachmentManager from './'
import stream from 'stream'

describe('AttachmentManager', function() {
  describe('create()', function() {
    beforeEach(function() {
      this.onAttachment = sinon.stub()
      this.attachmentManager = new AttachmentManager(this.onAttachment)
    })

    describe('buffer', function() {
      describe('with mime type', function() {
        beforeEach(function() {
          this.attachmentManager.create(new Buffer('my string'), 'text/special')
        })

        it('adds the data and media', function() {
          expect(this.onAttachment).to.have.been.calledOnce
          const attachment = this.onAttachment.firstCall.args[0]
          const encodedData = attachment.data
          expect(encodedData).to.eql('bXkgc3RyaW5n')
          const decodedData = new Buffer(encodedData, 'base64').toString()
          expect(decodedData).to.eql('my string')
          expect(attachment.media).to.eql({
            encoding: 'base64',
            type: 'text/special'
          })
        })
      })

      describe('without media type', function() {
        it('throws', function() {
          expect(() => {
            this.attachmentManager.create(new Buffer('my string'))
          }).to.throw('Buffer attachments must specify a media type')
        })
      })
    })

    describe('readable stream', function() {
      describe('with mime type', function() {
        describe('with callback', function() {
          beforeEach(function(done) {
            const readableStream = new stream.PassThrough()
            this.result = this.attachmentManager.create(
              readableStream,
              'text/special',
              done
            )
            setTimeout(function() {
              readableStream.write('my string')
              readableStream.end()
            }, 25)
          })

          it('does not return a promise', function() {
            expect(this.result).to.be.undefined
          })

          it('adds the data and media', function() {
            expect(this.onAttachment).to.have.been.calledOnce
            const attachment = this.onAttachment.firstCall.args[0]
            const encodedData = attachment.data
            expect(encodedData).to.eql('bXkgc3RyaW5n')
            const decodedData = new Buffer(encodedData, 'base64').toString()
            expect(decodedData).to.eql('my string')
            expect(attachment.media).to.eql({
              encoding: 'base64',
              type: 'text/special'
            })
          })
        })

        describe('without callback', function() {
          beforeEach(function() {
            const readableStream = new stream.PassThrough()
            this.result = this.attachmentManager.create(
              readableStream,
              'text/special'
            )
            setTimeout(function() {
              readableStream.write('my string')
              readableStream.end()
            }, 25)
            return this.result
          })

          it('returns a promise', function() {
            expect(this.result.then).to.be.a('function')
          })

          it('adds the data and media', function() {
            expect(this.onAttachment).to.have.been.calledOnce
            const attachment = this.onAttachment.firstCall.args[0]
            const encodedData = attachment.data
            expect(encodedData).to.eql('bXkgc3RyaW5n')
            const decodedData = new Buffer(encodedData, 'base64').toString()
            expect(decodedData).to.eql('my string')
            expect(attachment.media).to.eql({
              encoding: 'base64',
              type: 'text/special'
            })
          })
        })
      })

      describe('without media type', function() {
        it('throws', function() {
          expect(() => {
            const readableStream = new stream.PassThrough()
            this.attachmentManager.create(readableStream)
          }).to.throw('Stream attachments must specify a media type')
        })
      })
    })

    describe('string', function() {
      describe('with media type', function() {
        beforeEach(function() {
          this.attachmentManager.create('my string', 'text/special')
        })

        it('adds the data and media', function() {
          expect(this.onAttachment).to.have.been.calledOnce
          const attachment = this.onAttachment.firstCall.args[0]
          expect(attachment.data).to.eql('my string')
          expect(attachment.media).to.eql({ type: 'text/special' })
        })
      })

      describe('without mime type', function() {
        beforeEach(function() {
          this.attachmentManager.create('my string')
        })

        it('adds the data with the default mime type', function() {
          expect(this.onAttachment).to.have.been.calledOnce
          const attachment = this.onAttachment.firstCall.args[0]
          expect(attachment.data).to.eql('my string')
          expect(attachment.media).to.eql({ type: 'text/plain' })
        })
      })
    })

    describe('unsupported data type', function() {
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
