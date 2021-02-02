import UncaughtExceptionListener = NodeJS.UncaughtExceptionListener

const UncaughtExceptionManager = {
  registerHandler(handler: UncaughtExceptionListener): void {
    process.addListener('uncaughtException', handler)
  },

  unregisterHandler(handler: UncaughtExceptionListener): void {
    process.removeListener('uncaughtException', handler)
  },
}

export default UncaughtExceptionManager
