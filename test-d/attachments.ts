import { After } from '../'
import { expectError, expectType } from 'tsd'
import { PassThrough } from 'stream'

After(async function () {
  // log
  expectType<void>(this.log('things'))
  // string
  expectType<void>(this.attach('stuff'))
  expectType<void>(this.attach('{}', 'application/json'))
  // buffer
  expectType<void>(this.attach(Buffer.from('{}'), 'application/json'))
  // stream
  expectType<Promise<void>>(this.attach(new PassThrough(), 'application/json'))
  expectType<void>(
    this.attach(new PassThrough(), 'application/json', () => undefined)
  )
  // buffer and stream flavours must specify media type
  expectError(this.attach(Buffer.from('{}')))
  expectError(this.attach(new PassThrough()))
})
