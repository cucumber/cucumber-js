import Promise from 'bluebird'
import UserCodeRunner from '../user_code_runner'
import VError from 'verror'

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
          console.error(error)
          const location = this.getListenerErrorLocation({fnName, listener})
          //throw new VError(error, location)
        }
      }
    })
  }

  getListenerErrorLocation({fnName, listener}) {
    return listener.relativeUri || `${listener.constructor.name}::${fnName}`
  }
}
