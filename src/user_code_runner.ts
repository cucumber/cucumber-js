import util from 'node:util'
import { wrapPromiseWithTimeout } from './time'
import UncaughtExceptionManager from './uncaught_exception_manager'
import { doesHaveValue } from './value_checker'

export interface IRunRequest {
  argsArray: any[]
  thisArg: any
  fn: Function
  timeoutInMilliseconds: number
}

export interface IRunResponse {
  error?: any
  result?: any
}

const UserCodeRunner = {
  async run({
    argsArray,
    thisArg,
    fn,
    timeoutInMilliseconds,
  }: IRunRequest): Promise<IRunResponse> {
    const callbackPromise = new Promise((resolve, reject) => {
      argsArray.push((error: Error, result: IRunResponse) => {
        if (doesHaveValue(error)) {
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
      const error = e instanceof Error ? e : util.format(e)
      return { error }
    }

    const racingPromises = []
    const callbackInterface = fn.length === argsArray.length
    const promiseInterface =
      doesHaveValue(fnReturn) && typeof fnReturn.then === 'function'

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

    let finalPromise = Promise.race(racingPromises)
    if (timeoutInMilliseconds >= 0) {
      const timeoutMessage =
        'function timed out, ensure the ' +
        (callbackInterface ? 'callback is executed' : 'promise resolves') +
        ` within ${timeoutInMilliseconds.toString()} milliseconds`
      finalPromise = wrapPromiseWithTimeout(
        finalPromise,
        timeoutInMilliseconds,
        timeoutMessage
      )
    }

    let error, result
    try {
      result = await finalPromise
    } catch (e) {
      if (e instanceof Error) {
        error = e
      } else if (doesHaveValue(e)) {
        error = util.format(e)
      } else {
        error = new Error('Promise rejected without a reason')
      }
    }

    UncaughtExceptionManager.unregisterHandler(exceptionHandler)

    return { error, result }
  },
}

export default UserCodeRunner
