export default class UncaughtExceptionManager {
  static registerHandler(handler) {
    if (typeof(window) !== 'undefined') {
      window.onerror = handler
    } else {
      process.addListener('uncaughtException', handler)
    }
  }

  static unregisterHandler(handler) {
    if (typeof(window) !== 'undefined') {
      window.onerror = void(0)
    } else {
      process.removeListener('uncaughtException', handler)
    }
  }
}
