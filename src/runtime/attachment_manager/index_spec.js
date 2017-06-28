import AttachmentManager from './'
import stream from 'stream'

describe('AttachmentManager', function() {
  describe('create() / getAll()', function() {
    beforeEach(function() {
      this.attachmentManager = new AttachmentManager()
    })

    describe('buffer', function() {
      describe('with mime type', function() {
        beforeEach(function() {
          this.attachmentManager.create(new Buffer('my string'), 'text/special')
        })

        it('adds the data base64 encoded and mime type', function() {
          const attachments = this.attachmentManager.getAll()
          expect(attachments).to.have.lengthOf(1)
          const encodedData = attachments[0].data
          expect(encodedData).to.eql('bXkgc3RyaW5n')
          const decodedData = new Buffer(encodedData, 'base64').toString()
          expect(decodedData).to.eql('my string')
          expect(attachments[0].mimeType).to.eql('text/special')
        })
      })

      describe('without mime type', function() {
        it('throws', function() {
          expect(() => {
            this.attachmentManager.create(new Buffer('my string'))
          }).to.throw('Buffer attachments must specify a mimeType')
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

          it('adds the data base64 encoded and mime type', function() {
            const attachments = this.attachmentManager.getAll()
            expect(attachments).to.have.lengthOf(1)
            const encodedData = attachments[0].data
            expect(encodedData).to.eql('bXkgc3RyaW5n')
            const decodedData = new Buffer(encodedData, 'base64').toString()
            expect(decodedData).to.eql('my string')
            expect(attachments[0].mimeType).to.eql('text/special')
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

          it('adds the data base64 encoded and mime type', function() {
            const attachments = this.attachmentManager.getAll()
            expect(attachments).to.have.lengthOf(1)
            const encodedData = attachments[0].data
            expect(encodedData).to.eql('bXkgc3RyaW5n')
            const decodedData = new Buffer(encodedData, 'base64').toString()
            expect(decodedData).to.eql('my string')
            expect(attachments[0].mimeType).to.eql('text/special')
          })
        })
      })

      describe('without mime type', function() {
        it('throws', function() {
          expect(() => {
            const readableStream = new stream.PassThrough()
            this.attachmentManager.create(readableStream)
          }).to.throw('Stream attachments must specify a mimeType')
        })
      })
    })

    describe('string', function() {
      describe('with mime type', function() {
        beforeEach(function() {
          this.attachmentManager.create('my string', 'text/special')
        })

        it('adds the data and mime type', function() {
          const attachments = this.attachmentManager.getAll()
          expect(attachments).to.have.lengthOf(1)
          expect(attachments[0].data).to.eql('my string')
          expect(attachments[0].mimeType).to.eql('text/special')
        })
      })

      describe('without mime type', function() {
        beforeEach(function() {
          this.attachmentManager.create('my string')
        })

        it('adds the data with the default mime type', function() {
          const attachments = this.attachmentManager.getAll()
          expect(attachments).to.have.lengthOf(1)
          expect(attachments[0].data).to.eql('my string')
          expect(attachments[0].mimeType).to.eql('text/plain')
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
