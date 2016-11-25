import path from 'path'
import Promise from 'bluebird'
import UserCodeRunner from '../user_code_runner'

export default class EventBroadcaster {
  constructor({cwd, listenerDefaultTimeout, listeners}) {
    this.cwd = cwd
    this.listenerDefaultTimeout = listenerDefaultTimeout
    this.listeners = listeners
  }

  async broadcastAroundEvent(event, fn) {
    await this.broadcastEvent(event.buildBeforeEvent())
    await fn()
    await this.broadcastEvent(event.buildAfterEvent())
  }

  async broadcastEvent(event) {
    await Promise.each(this.listeners, async(listener) => {
      const fnName = `handle${event.name}`
      const handler = listener[fnName]
      if (handler) {
        const timeout = listener.timeout || this.listenerDefaultTimeout
        const {error} = await UserCodeRunner.run({
          argsArray: [event.data],
          fn: handler,
          timeoutInMilliseconds: timeout,
          thisArg: listener
        })
        if (error) {
          const location = this.getListenerErrorLocation({fnName, listener})
          throw this.prependLocationToError({error, location})
        }
      }
    })
  }

  getListenerErrorLocation({fnName, listener}) {
    if (listener.cwd && listener.uri) {
      return path.relative(listener.cwd, listener.uri) + ':' + listener.line
    } else {
      return `${listener.constructor.name}::${fnName}`
    }
  }

  prependLocationToError({error, location}) {
    if (error instanceof Error) {
      error.message = location + ' ' + error.message
    } else {
      error = location + ' ' + error
    }
    return error
  }
}
