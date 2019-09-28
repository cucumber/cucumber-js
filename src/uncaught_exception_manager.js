export default class UncaughtExceptionManager {
  static registerHandler(handler) {
    if (typeof window === 'undefined') {
      process.addListener('uncaughtException', handler)
    } else {
      window.onerror = handler
    }
  }

  static unregisterHandler(handler) {
    if (typeof window === 'undefined') {
      process.removeListener('uncaughtException', handler)
    } else {
      window.onerror = undefined
    }
  }
}
