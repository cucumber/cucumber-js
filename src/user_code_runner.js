import Promise from 'bluebird'
import Time from './time'
import UncaughtExceptionManager from './uncaught_exception_manager'
import util from 'util'

export default class UserCodeRunner {
  static async run ({argsArray, thisArg, fn, timeoutInMilliseconds}) {
    const callbackPromise = new Promise(function (resolve, reject) {
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
      const error = (e instanceof Error) ? e : util.format(e)
      return {error}
    }

    const racingPromises = []
    const callbackInterface = fn.length === argsArray.length
    const promiseInterface = fnReturn && typeof fnReturn.then === 'function'

    if (callbackInterface && promiseInterface) {
      return {error: 'function uses multiple asynchronous interfaces: callback and promise'}
    } else if (callbackInterface) {
      racingPromises.push(callbackPromise)
    } else if (promiseInterface) {
      racingPromises.push(fnReturn)
    } else {
      return {result: fnReturn}
    }

    let exceptionHandler
    const uncaughtExceptionPromise = new Promise(function (resolve, reject) {
      exceptionHandler = reject
      UncaughtExceptionManager.registerHandler(exceptionHandler)
    })
    racingPromises.push(uncaughtExceptionPromise)

    const timeoutPromise = new Promise(function (resolve, reject) {
      Time.setTimeout(function() {
        const timeoutMessage = 'function timed out after ' + timeoutInMilliseconds + ' milliseconds'
        reject(new Error(timeoutMessage))
      }, timeoutInMilliseconds)
    })
    racingPromises.push(timeoutPromise)

    let error, result
    try {
      result = await Promise.race(racingPromises)
    } catch (e) {
      if ((e instanceof Error)) {
        error = e
      } else if (e) {
        error = util.format(e)
      } else {
        error = 'Promise rejected without a reason'
      }
    }

    UncaughtExceptionManager.unregisterHandler(exceptionHandler)

    return {error, result}
  }
}
