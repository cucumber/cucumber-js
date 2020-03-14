import UncaughtExceptionListener = NodeJS.UncaughtExceptionListener

declare var window: any // For browsers

const UncaughtExceptionManager = {
  registerHandler(handler: UncaughtExceptionListener): void {
    if (typeof window === 'undefined') {
      process.addListener('uncaughtException', handler)
    } else {
      window.onerror = handler
    }
  },

  unregisterHandler(handler: UncaughtExceptionListener): void {
    if (typeof window === 'undefined') {
      process.removeListener('uncaughtException', handler)
    } else {
      window.onerror = undefined
    }
  },
}

export default UncaughtExceptionManager
