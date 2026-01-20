import assert from 'node:assert'
import { expect } from 'chai'
import { formatError } from './format_error'

describe('formatError', () => {
  describe('type and message', () => {
    function testFormatError(fn: () => void) {
      try {
        fn()
        return undefined
      } catch (error) {
        const {
          exception: { type, message },
        } = formatError(error, false)
        return { type, message }
      }
    }

    it('should handle a custom error', () => {
      expect(
        testFormatError(() => {
          assert.ok(false, 'Thing that should have been truthy was falsy!')
        })
      ).to.eql({
        type: 'AssertionError',
        message: 'Thing that should have been truthy was falsy!',
      })
    })

    it('should handle a generic error', () => {
      expect(
        testFormatError(() => {
          throw new Error('A generally bad thing happened!')
        })
      ).to.eql({
        type: 'Error',
        message: 'A generally bad thing happened!',
      })
    })

    it('should handle an omitted message', () => {
      expect(
        testFormatError(() => {
          throw new Error()
        })
      ).to.eql({
        type: 'Error',
        message: '',
      })
    })

    it('should handle a thrown string', () => {
      expect(
        testFormatError(() => {
          throw 'Yikes!'
        })
      ).to.eql({
        type: 'Error',
        message: 'Yikes!',
      })
    })
  })

  describe('stack traces', () => {
    ;[false, true].forEach((filterStackTraces) => {
      describe('with filterStackTraces=' + filterStackTraces, () => {
        function testFormatError(fn: () => void) {
          try {
            fn()
            return undefined
          } catch (error) {
            const {
              exception: { stackTrace },
            } = formatError(error, false)
            return stackTrace
          }
        }

        it('should handle a custom error', () => {
          const result = testFormatError(() => {
            assert.ok(false, 'Thing that should have been truthy was falsy!')
          })
          expect(result).to.have.string(' at ')
          expect(result).to.have.string(
            'AssertionError: Thing that should have been truthy was falsy!'
          )
        })

        it('should handle a generic error', () => {
          const result = testFormatError(() => {
            throw new Error('A generally bad thing happened!')
          })
          expect(result).to.have.string(' at ')
          expect(result).to.have.string(
            'Error: A generally bad thing happened!'
          )
        })

        it('should handle an omitted message', () => {
          const result = testFormatError(() => {
            throw new Error()
          })
          expect(result).to.have.string(' at ')
          expect(result).to.have.string('Error: ')
        })

        it('should handle a thrown string', () => {
          const result = testFormatError(() => {
            throw 'Yikes!'
          })
          expect(result).to.eq('Error: Yikes!')
        })
      })
    })
  })
})
