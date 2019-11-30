import { getUsage } from './helpers'
import Formatter from './'
export default class UsageJsonFormatter extends Formatter {
  constructor(options) {
    super(options)
    options.eventBroadcaster.on('envelope', envelope => {
      if (envelope.testRunFinished) {
        this.logUsage()
      }
    })
  }

  logUsage() {
    const usage = getUsage({
      cwd: this.cwd,
      stepDefinitions: this.supportCodeLibrary.stepDefinitions,
      eventDataCollector: this.eventDataCollector,
    })
    this.log(JSON.stringify(usage, this.replacer, 2))
  }

  replacer(key, value) {
    if (key === 'seconds') {
      return parseInt(value)
    }
    return value
  }
}
