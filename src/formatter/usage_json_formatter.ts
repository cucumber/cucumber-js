import { getUsage } from './helpers'
import Formatter from './'
import { doesHaveValue } from '../value_checker'

export default class UsageJsonFormatter extends Formatter {
  constructor(options) {
    super(options)
    options.eventBroadcaster.on('envelope', envelope => {
      if (doesHaveValue(envelope.testRunFinished)) {
        this.logUsage()
      }
    })
  }

  logUsage(): void {
    const usage = getUsage({
      cwd: this.cwd,
      stepDefinitions: this.supportCodeLibrary.stepDefinitions,
      eventDataCollector: this.eventDataCollector,
    })
    this.log(JSON.stringify(usage, this.replacer, 2))
  }

  replacer(key: string, value: any): any {
    if (key === 'seconds') {
      return parseInt(value)
    }
    return value
  }
}
