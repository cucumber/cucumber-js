import UserCodeRunner from './user_code_runner'
import Promise from 'bluebird'

describe('UserCodeRunner', function() {
  describe('run()', function() {
    beforeEach(function() {
      this.options = {
        argsArray: [],
        thisArg: {},
        timeoutInMilliseconds: 100
      }
    })

    describe('function uses synchronous interface', function() {
      describe('function throws serializable error', function() {
        beforeEach(function() {
          this.options.fn = function() {
            throw 'error'
          }
        })

        it('returns the error', async function() {
          const { error, result } = await UserCodeRunner.run(this.options)
          expect(error).to.be.instanceOf(Error)
          expect(error.message).to.eql('error')
          expect(result).to.be.undefined
        })
      })

      describe('function throws non-serializable error', function() {
        beforeEach(function() {
          this.options.fn = function() {
            const error = {}
            error.error = error
            throw error
          }
        })

        it('returns the error', async function() {
          const { error, result } = await UserCodeRunner.run(this.options)
          expect(error).to.be.instanceOf(Error)
          expect(error.message).to.eql('{ error: [Circular] }')
          expect(result).to.be.undefined
        })
      })

      describe('function returns', function() {
        beforeEach(function() {
          this.options.fn = function() {
            return 'result'
          }
        })

        it('returns the return value of the function', async function() {
          const { error, result } = await UserCodeRunner.run(this.options)
          expect(error).to.be.undefined
          expect(result).to.eql('result')
        })
      })
    })

    describe('function uses callback interface', function() {
      describe('function asynchronously throws', function() {
        // Cannot unit test because mocha also sets an uncaught exception handler
      })

      describe('function calls back with serializable error', function() {
        beforeEach(function() {
          this.options.fn = function(callback) {
            setTimeout(function() {
              callback('error')
            }, 25)
          }
        })

        it('returns the error', async function() {
          const { error, result } = await UserCodeRunner.run(this.options)
          expect(error).to.be.instanceOf(Error)
          expect(error.message).to.eql('error')
          expect(result).to.be.undefined
        })
      })

      describe('function calls back with non-serializable rror', function() {
        beforeEach(function() {
          this.options.fn = function(callback) {
            const error = {}
            error.error = error
            setTimeout(function() {
              callback(error)
            }, 25)
          }
        })

        it('returns the error', async function() {
          const { error, result } = await UserCodeRunner.run(this.options)
          expect(error).to.be.instanceOf(Error)
          expect(error.message).to.eql('{ error: [Circular] }')
          expect(result).to.be.undefined
        })
      })

      describe('function calls back with result', function() {
        beforeEach(function() {
          this.options.fn = function(callback) {
            setTimeout(function() {
              callback(null, 'result')
            }, 25)
          }
        })

        it('returns the what the function calls back with', async function() {
          const { error, result } = await UserCodeRunner.run(this.options)
          expect(error).to.be.undefined
          expect(result).to.eql('result')
        })
      })

      describe('function times out', function() {
        beforeEach(function() {
          this.options.fn = function(callback) {
            setTimeout(function() {
              callback(null, 'result')
            }, 200)
          }
        })

        it('returns timeout as an error', async function() {
          const { error, result } = await UserCodeRunner.run(this.options)
          expect(error).to.be.instanceof(Error)
          expect(error.message).to.eql(
            'function timed out after 100 milliseconds'
          )
          expect(result).to.be.undefined
        })
      })

      describe('timeout of -1', function() {
        beforeEach(function() {
          this.options.fn = function(callback) {
            setTimeout(function() {
              callback(null, 'result')
            }, 200)
          }
          this.options.timeoutInMilliseconds = -1
        })

        it('disables timeout protection', async function() {
          const { error, result } = await UserCodeRunner.run(this.options)
          expect(error).to.be.undefined
          expect(result).to.eql('result')
        })
      })
    })

    describe('function uses promise interface', function() {
      describe('function asynchronously throws', function() {
        // Cannot unit test because mocha also sets an uncaught exception handler
      })

      describe('promise resolves', function() {
        beforeEach(function() {
          this.options.fn = function() {
            return Promise.resolve('result')
          }
        })

        it('returns what the promise resolves to', async function() {
          const { error, result } = await UserCodeRunner.run(this.options)
          expect(error).to.be.undefined
          expect(result).to.eql('result')
        })
      })

      describe('promise rejects with reason', function() {
        beforeEach(function() {
          this.options.fn = function() {
            return Promise.reject('error')
          }
        })

        it('returns what the promise rejects as an error', async function() {
          const { error, result } = await UserCodeRunner.run(this.options)
          expect(error).to.be.instanceOf(Error)
          expect(error.message).to.eql('error')
          expect(result).to.be.undefined
        })
      })

      describe('promise rejects without reason', function() {
        beforeEach(function() {
          this.options.fn = function() {
            return Promise.reject()
          }
        })

        it('returns a helpful error message', async function() {
          const { error, result } = await UserCodeRunner.run(this.options)
          expect(error).to.be.instanceOf(Error)
          expect(error.message).to.eql('Promise rejected without a reason')
          expect(result).to.be.undefined
        })
      })

      describe('function times out', function() {
        beforeEach(function() {
          this.options.fn = function() {
            return Promise.resolve('result').delay(200)
          }
        })

        it('returns timeout as an error', async function() {
          const { error, result } = await UserCodeRunner.run(this.options)
          expect(error).to.be.instanceof(Error)
          expect(error.message).to.eql(
            'function timed out after 100 milliseconds'
          )
          expect(result).to.be.undefined
        })
      })

      describe('timeout of -1', function() {
        beforeEach(function() {
          this.options.fn = function() {
            return Promise.resolve('result').delay(200)
          }
          this.options.timeoutInMilliseconds = -1
        })

        it('disables timeout protection', async function() {
          const { error, result } = await UserCodeRunner.run(this.options)
          expect(error).to.be.undefined
          expect(result).to.eql('result')
        })
      })
    })

    describe('function uses multiple asynchronous interfaces: callback and promise', function() {
      beforeEach(function() {
        this.options.fn = function(callback) {
          callback()
          return Promise.resolve()
        }
      })

      it('returns an error that multiple interface are used', async function() {
        const { error, result } = await UserCodeRunner.run(this.options)
        expect(error).to.be.instanceof(Error)
        expect(error.message).to.eql(
          'function uses multiple asynchronous interfaces: callback and promise\n' +
            'to use the callback interface: do not return a promise\n' +
            'to use the promise interface: remove the last argument to the function'
        )
        expect(result).to.be.undefined
      })
    })
  })
})
