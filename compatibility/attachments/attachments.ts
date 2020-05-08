import { When } from '../..'
import { ReadableStreamBuffer } from 'stream-buffers'
import World from "../../src/support_code_library_builder/world";

When('the string {string} is attached as {string}', async function(
  this: World,
  text: string,
  mediaType: string
) {
  await this.attach(text, mediaType)
})

When('an array with {int} bytes are attached as {string}', async function(
  this: World,
  size: number,
  mediaType: string
) {
  const data = [...Array(size).keys()]
  const buffer = Buffer.from(data)
  await this.attach(buffer, mediaType)
})

When('a stream with {int} bytes are attached as {string}', async function(
  this: World,
  size: number,
  mediaType: string
) {
  const data = [...Array(size).keys()]
  const buffer = Buffer.from(data)
  const stream = new ReadableStreamBuffer({ chunkSize: 1, frequency: 1 })
  stream.put(buffer)
  stream.stop()
  await this.attach(stream, mediaType)
})
