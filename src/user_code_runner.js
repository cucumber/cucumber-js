import Promise from 'bluebird'
import Time from './time'
import UncaughtExceptionManager from './uncaught_exception_manager'
import util from 'util'

export default class UserCodeRunner {
  static async run({ argsArray, thisArg, fn, timeoutInMilliseconds }) {
    const callbackPromise = new Promise((resolve, reject) => {
      argsArray.push((error, result) => {
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
          'function uses multiple asynchronous interfaces: callback and promise\n' +
            'to use the callback interface: do not return a promise\n' +
            'to use the promise interface: remove the last argument to the function'
        ),
      }
    } else if (callbackInterface) {
      racingPromises.push(callbackPromise)
    } else if (promiseInterface) {
      racingPromises.push(fnReturn)
    } else {
      return { result: fnReturn }
    }

    let exceptionHandler
    const uncaughtExceptionPromise = new Promise((resolve, reject) => {
      exceptionHandler = reject
      UncaughtExceptionManager.registerHandler(exceptionHandler)
    })
    racingPromises.push(uncaughtExceptionPromise)

    let timeoutId
    if (timeoutInMilliseconds >= 0) {
      const timeoutPromise = new Promise((resolve, reject) => {
        timeoutId = Time.setTimeout(() => {
          const timeoutMessage =
            'function timed out, ensure the ' +
            (callbackInterface ? 'callback is executed' : 'promise resolves') +
            ` within ${timeoutInMilliseconds} milliseconds`
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
