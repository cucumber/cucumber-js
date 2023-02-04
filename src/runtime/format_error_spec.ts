import { expect } from 'chai'
import assert from 'assert'
import { formatError } from './format_error'

describe('formatError', () => {
  function testFormatError(fn: () => void, filterStackTraces: boolean = false) {
    try {
      fn()
      return undefined
    } catch (error) {
      return formatError(error, filterStackTraces)
    }
  }

  it('should handle a custom error', () => {
    expect(
      testFormatError(() => {
        assert.ok(false, 'Thing that should have been truthy was falsy!')
      }).exception
    ).to.eql({
      type: 'AssertionError',
      message: 'Thing that should have been truthy was falsy!',
    })
  })

  it('should handle a generic error', () => {
    expect(
      testFormatError(() => {
        throw new Error('A generally bad thing happened!')
      }).exception
    ).to.eql({
      type: 'Error',
      message: 'A generally bad thing happened!',
    })
  })
})
