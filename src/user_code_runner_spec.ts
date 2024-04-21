import { describe, it } from 'mocha'
import { expect } from 'chai'
import semver from 'semver'
import UserCodeRunner, { IRunRequest, IRunResponse } from './user_code_runner'

async function testUserCodeRunner(
  opts: Partial<IRunRequest>
): Promise<IRunResponse> {
  return await UserCodeRunner.run({
    argsArray: [],
    fn: () => 'result',
    thisArg: {},
    timeoutInMilliseconds: 100,
    ...opts,
  })
}

type CallbackFn = (error?: any, result?: any) => void

describe('UserCodeRunner', () => {
  describe('run()', () => {
    describe('function uses synchronous interface', () => {
      describe('function throws serializable error', () => {
        it('returns the error', async function () {
          // Arrange
          const fn = function (): void {
            throw 'error' // eslint-disable-line @typescript-eslint/no-throw-literal
          }

          // Act
          const { error, result } = await testUserCodeRunner({ fn })

          // Assert
          expect(error).to.eql('error')
          expect(result).to.eql(undefined)
        })
      })

      describe('function throws non-serializable error', () => {
        it('returns the error', async function () {
          // Arrange
          const fn = function (): void {
            const error: any = {}
            error.loop = error
            throw error
          }

          // Act
          const { error, result } = await testUserCodeRunner({ fn })

          // Assert
          if (semver.satisfies(process.version, '>=14.0.0')) {
            expect(error).to.eql('<ref *1> { loop: [Circular *1] }')
          } else {
            expect(error).to.eql('{ loop: [Circular] }')
          }
          expect(result).to.eql(undefined)
        })
      })

      describe('function returns', () => {
        it('returns the return value of the function', async function () {
          // Arrange
          const fn = function (): string {
            return 'result'
          }

          // Act
          const { error, result } = await testUserCodeRunner({ fn })

          // Assert
          expect(error).to.eql(undefined)
          expect(result).to.eql('result')
        })
      })
    })

    describe('function uses callback interface', () => {
      describe('function asynchronously throws', () => {
        // Cannot unit test because mocha also sets an uncaught exception handler
      })

      describe('function calls back with serializable error', () => {
        it('returns the error', async function () {
          // Arrange
          const fn = function (callback: CallbackFn): void {
            setTimeout(() => {
              callback('error') // eslint-disable-line node/no-callback-literal
            }, 25)
          }

          // Act
          const { error, result } = await testUserCodeRunner({ fn })

          // Assert
          expect(error).to.eql('error')
          expect(result).to.eql(undefined)
        })
      })

      describe('function calls back with non-serializable error', () => {
        it('returns the error', async function () {
          // Arrange
          const fn = function (callback: CallbackFn): void {
            const error: any = {}
            error.loop = error
            setTimeout(() => {
              callback(error)
            }, 25)
          }

          // Act
          const { error, result } = await testUserCodeRunner({ fn })

          // Assert
          if (semver.satisfies(process.version, '>=14.0.0')) {
            expect(error).to.eql('<ref *1> { loop: [Circular *1] }')
          } else {
            expect(error).to.eql('{ loop: [Circular] }')
          }
          expect(result).to.eql(undefined)
        })
      })

      describe('function calls back with result', () => {
        it('returns the what the function calls back with', async function () {
          // Arrange
          const fn = function (callback: CallbackFn): void {
            setTimeout(() => {
              callback(null, 'result')
            }, 25)
          }

          // Act
          const { error, result } = await testUserCodeRunner({ fn })

          // Assert
          expect(error).to.eql(undefined)
          expect(result).to.eql('result')
        })
      })

      describe('function times out', () => {
        it('returns timeout as an error', async function () {
          // Arrange
          const fn = function (callback: CallbackFn): void {
            setTimeout(() => {
              callback(null, 'result')
            }, 200)
          }

          // Act
          const { error, result } = await testUserCodeRunner({ fn })

          // Assert
          expect(error).to.be.instanceof(Error)
          expect(error.message).to.eql(
            'function timed out, ensure the callback is executed within 100 milliseconds'
          )
          expect(result).to.eql(undefined)
        })
      })

      describe('timeout of -1', () => {
        it('disables timeout protection', async function () {
          // Arrange
          const fn = function (callback: CallbackFn): void {
            setTimeout(() => {
              callback(null, 'result')
            }, 200)
          }

          // Act
          const { error, result } = await testUserCodeRunner({
            fn,
            timeoutInMilliseconds: -1,
          })

          // Assert
          expect(error).to.eql(undefined)
          expect(result).to.eql('result')
        })
      })
    })

    describe('function uses promise interface', () => {
      describe('function asynchronously throws', () => {
        // Cannot unit test because mocha also sets an uncaught exception handler
      })

      describe('promise resolves', () => {
        it('returns what the promise resolves to', async function () {
          // Arrange
          const fn = async function (): Promise<string> {
            return 'result'
          }

          // Act
          const { error, result } = await testUserCodeRunner({ fn })

          // Assert
          expect(error).to.eql(undefined)
          expect(result).to.eql('result')
        })
      })

      describe('promise rejects with reason', () => {
        it('returns what the promise rejects as an error', async function () {
          // Arrange
          const fn = async function (): Promise<void> {
            throw 'error'
          }

          // Act
          const { error, result } = await testUserCodeRunner({ fn })

          // Assert
          expect(error).to.eql('error')
          expect(result).to.eql(undefined)
        })
      })

      describe('promise rejects without reason', () => {
        it('returns a helpful error message', async function () {
          // Arrange
          const fn = async function (): Promise<void> {
            return await Promise.reject() // eslint-disable-line prefer-promise-reject-errors
          }

          // Act
          const { error, result } = await testUserCodeRunner({ fn })

          // Assert
          expect(error).to.be.instanceOf(Error)
          expect(error.message).to.eql('Promise rejected without a reason')
          expect(result).to.eql(undefined)
        })
      })

      describe('promise times out', function () {
        it('returns timeout as an error', async function () {
          // Arrange
          const fn = async function (): Promise<string> {
            return await new Promise((resolve) => {
              setTimeout(() => resolve('result'), 200)
            })
          }

          // Act
          const { error, result } = await testUserCodeRunner({ fn })

          // Assert
          expect(error).to.be.instanceof(Error)
          expect(error.message).to.eql(
            'function timed out, ensure the promise resolves within 100 milliseconds'
          )
          expect(result).to.eql(undefined)
        })
      })

      describe('timeout of -1', () => {
        it('disables timeout protection', async function () {
          // Arrange
          const fn = async function (): Promise<string> {
            return await new Promise((resolve) => {
              setTimeout(() => resolve('result'), 200)
            })
          }

          // Act
          const { error, result } = await testUserCodeRunner({
            fn,
            timeoutInMilliseconds: -1,
          })

          // Assert
          expect(error).to.eql(undefined)
          expect(result).to.eql('result')
        })
      })
    })

    describe('function uses multiple asynchronous interfaces: callback and promise', () => {
      it('returns an error that multiple interface are used', async function () {
        // Arrange
        const fn = async function (callback: CallbackFn): Promise<void> {
          callback()
          return await Promise.resolve()
        }

        // Act
        const { error, result } = await testUserCodeRunner({ fn })

        // Assert
        expect(error).to.be.instanceof(Error)
        expect(error.message).to.eql(
          'function uses multiple asynchronous interfaces: callback and promise\n' +
            'to use the callback interface: do not return a promise\n' +
            'to use the promise interface: remove the last argument to the function'
        )
        expect(result).to.eql(undefined)
      })
    })
  })
})
