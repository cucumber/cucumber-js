import Promise from 'bluebird'
import Time from './time'
import UncaughtExceptionManager from './uncaught_exception_manager'
import util from 'util'

export default class UserCodeRunner {
  static async run({ argsArray, thisArg, fn, timeoutInMilliseconds }) {
    const callbackPromise = new Promise(function(resolve, reject) {
      argsArray.push(function(error, result) {
        if (error) {
          reject(error)
        } else {
          resolve(result)
        }
      })
    })

    let fnReturn
    try {
      fnReturn = fn.apply(thisArg, argsArray)
    } catch (e) {
      const error = e instanceof Error ? e : new Error(util.format(e))
      return { error }
    }

    const racingPromises = []
    const callbackInterface = fn.length === argsArray.length
    const promiseInterface = fnReturn && typeof fnReturn.then === 'function'

    if (callbackInterface && promiseInterface) {
      return {
        error: new Error(
          'function uses multiple asynchronous interfaces: callback and promise'
        )
      }
    } else if (callbackInterface) {
      racingPromises.push(callbackPromise)
    } else if (promiseInterface) {
      racingPromises.push(fnReturn)
    } else {
      return { result: fnReturn }
    }

    let exceptionHandler
    const uncaughtExceptionPromise = new Promise(function(resolve, reject) {
      exceptionHandler = reject
      UncaughtExceptionManager.registerHandler(exceptionHandler)
    })
    racingPromises.push(uncaughtExceptionPromise)

    let timeoutId
    if (timeoutInMilliseconds >= 0) {
      const timeoutPromise = new Promise(function(resolve, reject) {
        timeoutId = Time.setTimeout(function() {
          const timeoutMessage =
            'function timed out after ' +
            timeoutInMilliseconds +
            ' milliseconds'
          reject(new Error(timeoutMessage))
        }, timeoutInMilliseconds)
      })
      racingPromises.push(timeoutPromise)
    }

    let error, result
    try {
      result = await Promise.race(racingPromises)
    } catch (e) {
      if (e instanceof Error) {
        error = e
      } else if (e) {
        error = new Error(util.format(e))
      } else {
        error = new Error('Promise rejected without a reason')
      }
    }

    Time.clearTimeout(timeoutId)
    UncaughtExceptionManager.unregisterHandler(exceptionHandler)

    return { error, result }
  }
}
