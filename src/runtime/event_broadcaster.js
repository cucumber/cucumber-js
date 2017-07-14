import Promise from 'bluebird'
import UserCodeRunner from '../user_code_runner'
import VError from 'verror'

export default class EventBroadcaster {
  constructor({ cwd, listenerDefaultTimeout, listeners }) {
    this.cwd = cwd
    this.listenerDefaultTimeout = listenerDefaultTimeout
    this.listeners = listeners
  }

  async broadcastAroundEvent(event, fn) {
    await this.broadcastEvent(event.buildBeforeEvent())
    await fn()
    await this.broadcastEvent(event.buildAfterEvent())
  }

  broadcastEvent(event) {
    return Promise.each(this.listeners, async listener => {
      const fnName = `handle${event.name}`
      const handler = listener[fnName]
      if (handler) {
        const timeout = listener.timeout || this.listenerDefaultTimeout
        const { error } = await UserCodeRunner.run({
          argsArray: [event.data],
          fn: handler,
          thisArg: listener,
          timeoutInMilliseconds: timeout
        })
        if (error) {
          const location = this.getListenerErrorLocation({ fnName, listener })
          throw new VError(
            error,
            `a handler errored, process exiting: ${location}`
          )
        }
      }
    })
  }

  getListenerErrorLocation({ fnName, listener }) {
    return listener.location || `${listener.constructor.name}::${fnName}`
  }
}
