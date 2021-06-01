import { Before, When, World } from '../../../src'
import { ReadableStreamBuffer } from 'stream-buffers'
import fs from 'fs'
import path from 'path'

Before((): void => undefined)

When(
  'the string {string} is attached as {string}',
  async function (this: World, text: string, mediaType: string) {
    await this.attach(text, mediaType)
  }
)

When(
  'the string {string} is logged',
  async function (this: World, text: string) {
    await this.log(text)
  }
)

When('text with ANSI escapes is logged', async function (this: World) {
  await this.log(
    'This displays a \x1b[31mr\x1b[0m\x1b[91ma\x1b[0m\x1b[33mi\x1b[0m\x1b[32mn\x1b[0m\x1b[34mb\x1b[0m\x1b[95mo\x1b[0m\x1b[35mw\x1b[0m'
  )
})

When(
  'the following string is attached as {string}:',
  async function (this: World, mediaType: string, text: string) {
    await this.attach(text, mediaType)
  }
)

When(
  'an array with {int} bytes is attached as {string}',
  async function (this: World, size: number, mediaType: string) {
    const data = [...Array(size).keys()]
    const buffer = Buffer.from(data)
    await this.attach(buffer, mediaType)
  }
)

When(
  'a stream with {int} bytes are attached as {string}',
  async function (this: World, size: number, mediaType: string) {
    const data = [...Array(size).keys()]
    const buffer = Buffer.from(data)
    const stream = new ReadableStreamBuffer({ chunkSize: 1, frequency: 1 })
    stream.put(buffer)
    stream.stop()
    await this.attach(stream, mediaType)
  }
)

When('a JPEG image is attached', async function (this: World) {
  await this.attach(
    fs.createReadStream(
      path.join(
        process.cwd(),
        'node_modules',
        '@cucumber',
        'compatibility-kit',
        'features',
        'attachments',
        'cucumber-growing-on-vine.jpg'
      )
    ),
    'image/jpg'
  )
})
