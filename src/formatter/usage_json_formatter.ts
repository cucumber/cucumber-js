import * as messages from '@cucumber/messages'
import { doesHaveValue } from '../value_checker'
import { getUsage } from './helpers'
import Formatter, { IFormatterOptions } from './'
import IEnvelope = messages.Envelope

export default class UsageJsonFormatter extends Formatter {
  public static readonly documentation: string =
    'Does what the Usage Formatter does, but outputs JSON, which can be output to a file and then consumed by other tools.'

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
