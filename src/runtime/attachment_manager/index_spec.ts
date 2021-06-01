import { describe, it } from 'mocha'
import { expect } from 'chai'
import AttachmentManager, { IAttachment } from './'
import stream, { Readable } from 'stream'

describe('AttachmentManager', () => {
  describe('create()', () => {
    describe('buffer', () => {
      describe('with mime type', () => {
        it('adds the data and media', function () {
          // Arrange
          const attachments: IAttachment[] = []
          const attachmentManager = new AttachmentManager((x) =>
            attachments.push(x)
          )

          // Act
          const result = attachmentManager.create(
            Buffer.from('my string'),
            'text/special'
          )

          // Assert
          expect(result).to.eql(undefined)
          expect(attachments).to.eql([
            {
              data: 'bXkgc3RyaW5n',
              media: {
                contentType: 'text/special',
                encoding: 'BASE64',
              },
            },
          ])
          const decodedData = Buffer.from(
            attachments[0].data,
            'base64'
          ).toString()
          expect(decodedData).to.eql('my string')
        })
      })

      describe('without media type', () => {
        it('throws', function () {
          // Arrange
          const attachments: IAttachment[] = []
          const attachmentManager = new AttachmentManager((x) =>
            attachments.push(x)
          )
          let error: Error
          let result: any

          // Act
          try {
            result = attachmentManager.create(Buffer.from('my string'))
          } catch (e) {
            error = e
          }

          // Assert
          expect(result).to.eql(undefined)
          expect(error).to.exist()
          expect(error.message).to.eql(
            'Buffer attachments must specify a media type'
          )
        })
      })
    })

    describe('readable stream', () => {
      describe('with mime type', () => {
        describe('with callback', () => {
          it('does not return a promise and adds the data and media', async function () {
            // Arrange
            const attachments: IAttachment[] = []
            const attachmentManager = new AttachmentManager((x) =>
              attachments.push(x)
            )
            const readableStream = new stream.PassThrough()
            let result: any

            // Act
            await new Promise<void>((resolve) => {
              result = attachmentManager.create(
                readableStream,
                'text/special',
                resolve
              )
              setTimeout(() => {
                readableStream.write('my string')
                readableStream.end()
              }, 25)
            })

            // Assert
            expect(result).to.eql(undefined)
            expect(attachments).to.eql([
              {
                data: 'bXkgc3RyaW5n',
                media: {
                  contentType: 'text/special',
                  encoding: 'BASE64',
                },
              },
            ])
            const decodedData = Buffer.from(
              attachments[0].data,
              'base64'
            ).toString()
            expect(decodedData).to.eql('my string')
          })
        })

        describe('without callback', () => {
          it('returns a promise and adds the data and media', async function () {
            // Arrange
            const attachments: IAttachment[] = []
            const attachmentManager = new AttachmentManager((x) =>
              attachments.push(x)
            )
            const readableStream = new stream.PassThrough()

            // Act
            const result = attachmentManager.create(
              readableStream,
              'text/special'
            )
            setTimeout(() => {
              readableStream.write('my string')
              readableStream.end()
            }, 25)
            await result

            // Assert
            expect(attachments).to.eql([
              {
                data: 'bXkgc3RyaW5n',
                media: {
                  contentType: 'text/special',
                  encoding: 'BASE64',
                },
              },
            ])
            const decodedData = Buffer.from(
              attachments[0].data,
              'base64'
            ).toString()
            expect(decodedData).to.eql('my string')
          })
        })
      })

      describe('without media type', () => {
        it('throws', function () {
          // Arrange
          const attachments: IAttachment[] = []
          const attachmentManager = new AttachmentManager((x) =>
            attachments.push(x)
          )
          const readableStream = new stream.PassThrough()
          let error: Error
          let result: any

          // Act
          try {
            result = attachmentManager.create(readableStream)
          } catch (e) {
            error = e
          }

          // Assert
          expect(result).to.eql(undefined)
          expect(error).to.exist()
          expect(error.message).to.eql(
            'Stream attachments must specify a media type'
          )
        })
      })
    })

    describe('string', () => {
      describe('with media type', () => {
        it('adds the data and media', function () {
          // Arrange
          const attachments: IAttachment[] = []
          const attachmentManager = new AttachmentManager((x) =>
            attachments.push(x)
          )

          // Act
          const result = attachmentManager.create('my string', 'text/special')

          // Assert
          expect(result).to.eql(undefined)
          expect(attachments).to.eql([
            {
              data: 'my string',
              media: {
                contentType: 'text/special',
                encoding: 'IDENTITY',
              },
            },
          ])
        })
      })

      describe('with media type, already base64 encoded', () => {
        it('adds the data and media', function () {
          // Arrange
          const attachments: IAttachment[] = []
          const attachmentManager = new AttachmentManager((x) =>
            attachments.push(x)
          )

          // Act
          const result = attachmentManager.create(
            Buffer.from('my string', 'utf8').toString('base64'),
            'base64:text/special'
          )

          // Assert
          expect(result).to.eql(undefined)
          expect(attachments).to.eql([
            {
              data: 'bXkgc3RyaW5n',
              media: {
                contentType: 'text/special',
                encoding: 'BASE64',
              },
            },
          ])
        })
      })

      describe('without mime type', () => {
        it('adds the data with the default mime type', function () {
          // Arrange
          const attachments: IAttachment[] = []
          const attachmentManager = new AttachmentManager((x) =>
            attachments.push(x)
          )

          // Act
          const result = attachmentManager.create('my string')

          // Assert
          expect(result).to.eql(undefined)
          expect(attachments).to.eql([
            {
              data: 'my string',
              media: {
                contentType: 'text/plain',
                encoding: 'IDENTITY',
              },
            },
          ])
        })
      })
    })

    describe('log', () => {
      it('adds a string attachment with the appropriate mime type', function () {
        // Arrange
        const attachments: IAttachment[] = []
        const attachmentManager = new AttachmentManager((x) =>
          attachments.push(x)
        )

        // Act
        const result = attachmentManager.log('stuff happened')

        // Assert
        expect(result).to.eql(undefined)
        expect(attachments).to.eql([
          {
            data: 'stuff happened',
            media: {
              contentType: 'text/x.cucumber.log+plain',
              encoding: 'IDENTITY',
            },
          },
        ])
      })
    })

    describe('unsupported data type', () => {
      it('throws', function () {
        // Arrange
        const attachments: IAttachment[] = []
        const attachmentManager = new AttachmentManager((x) =>
          attachments.push(x)
        )
        let error: Error
        let result: any

        // Act
        try {
          const obj = {}
          result = attachmentManager.create(obj as Readable, 'object/special')
        } catch (e) {
          error = e
        }

        // Assert
        expect(result).to.eql(undefined)
        expect(error).to.exist()
        expect(error.message).to.eql(
          'Invalid attachment data: must be a buffer, readable stream, or string'
        )
      })
    })
  })
})
