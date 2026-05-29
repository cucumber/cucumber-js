import assert from 'node:assert'
import { stripVTControlCharacters } from 'node:util'
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
      describe(`with filterStackTraces=${filterStackTraces}`, () => {
        function testFormatError(fn: () => void) {
          try {
            fn()
            return undefined
          } catch (error) {
            const {
              exception: { stackTrace },
            } = formatError(error, filterStackTraces)
            return stackTrace
          }
        }

        it('should handle a custom error', () => {
          const result = testFormatError(() => {
            assert.ok(false, 'Thing that should have been truthy was falsy!')
          })
          expect(result).to.have.string(' at ')
          expect(result).to.have.string('AssertionError')
          expect(result).to.have.string('Thing that should have been truthy was falsy!')
        })

        it('should handle a generic error', () => {
          const result = testFormatError(() => {
            throw new Error('A generally bad thing happened!')
          })
          expect(result).to.have.string(' at ')
          expect(result).to.have.string('Error: A generally bad thing happened!')
        })

        it('should handle an assertion error', () => {
          const result = testFormatError(() => {
            assert.equal(1, 2, 'number go up')
          })
          const sanitised = stripVTControlCharacters(result)
          expect(sanitised).to.have.string('number go up')
          expect(sanitised).to.have.string('+ expected')
          expect(sanitised).to.have.string('- actual')
          expect(sanitised).to.have.string('-1')
          expect(sanitised).to.have.string('+2')
        })

        it('should handle an omitted message', () => {
          const result = testFormatError(() => {
            throw new Error()
          })
          expect(result).to.have.string(' at ')
          expect(result).to.have.string('{}')
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

  describe('error cause', () => {
    it('appends the cause to message and stackTrace', () => {
      const original = new Error('Original cause')
      const wrapper = new Error('Wrapper message', { cause: original })

      const { message, exception } = formatError(wrapper, false)

      expect(exception.stackTrace).to.have.string('Error: Wrapper message')
      expect(exception.stackTrace).to.have.string('Caused by: Error: Original cause')
      expect(message).to.have.string('Caused by: Error: Original cause')
    })

    it('includes the stack frames of the cause', () => {
      const original = new Error('Original cause')
      const wrapper = new Error('Wrapper message', { cause: original })

      const { exception } = formatError(wrapper, false)

      const causeBlock = exception.stackTrace.slice(exception.stackTrace.indexOf('Caused by:'))
      expect(causeBlock).to.have.string(' at ')
    })

    it('surfaces multiple levels of nesting', () => {
      const root = new Error('Root cause')
      const middle = new Error('Middle cause', { cause: root })
      const wrapper = new Error('Wrapper message', { cause: middle })

      const { exception } = formatError(wrapper, false)

      expect(exception.stackTrace).to.have.string('Error: Wrapper message')
      expect(exception.stackTrace).to.have.string('Caused by: Error: Middle cause')
      expect(exception.stackTrace).to.have.string('Caused by: Error: Root cause')
    })

    it('handles a non-Error cause', () => {
      const wrapper = new Error('Wrapper message', { cause: 'a string reason' })

      const { exception } = formatError(wrapper, false)

      expect(exception.stackTrace).to.have.string('Caused by: a string reason')
    })

    it('stops at the maximum cause depth', () => {
      let error = new Error('cause 0')
      for (let i = 1; i <= 15; i++) {
        error = new Error(`cause ${i}`, { cause: error })
      }

      const { exception } = formatError(error, false)

      expect(exception.stackTrace).to.have.string('... (further causes truncated)')
    })

    it('detects circular cause references', () => {
      const a = new Error('A')
      const b = new Error('B', { cause: a })
      ;(a as { cause?: unknown }).cause = b

      const { exception } = formatError(b, false)

      expect(exception.stackTrace).to.have.string('... (circular reference)')
    })

    it('does nothing when cause is absent', () => {
      const plain = new Error('No cause here')

      const { exception } = formatError(plain, false)

      expect(exception.stackTrace).to.not.have.string('Caused by:')
    })
  })
})
