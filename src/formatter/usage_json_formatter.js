import { getUsage } from './helpers'
import Formatter from './'

export default class UsageJsonFormatter extends Formatter {
  constructor(options) {
    super(options)
    options.eventBroadcaster.on('test-run-finished', ::this.logUsage)
  }

  logUsage() {
    const usage = getUsage({
      cwd: this.cwd,
      stepDefinitions: this.supportCodeLibrary.stepDefinitions,
      eventDataCollector: this.eventDataCollector,
    })
    this.log(JSON.stringify(usage, null, 2))
  }
}
