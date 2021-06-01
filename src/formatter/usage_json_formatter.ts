import { getUsage } from './helpers'
import Formatter, { IFormatterOptions } from './'
import { doesHaveValue } from '../value_checker'
import * as messages from '@cucumber/messages'
import IEnvelope = messages.Envelope

export default class UsageJsonFormatter extends Formatter {
  constructor(options: IFormatterOptions) {
    super(options)
    options.eventBroadcaster.on('envelope', (envelope: IEnvelope) => {
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
