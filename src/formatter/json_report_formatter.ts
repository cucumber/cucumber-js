import * as messages from '@cucumber/messages'
import Formatter, { IFormatterOptions } from '.'
import ReportGenerator from './helpers/report_generator'
export default class JsonReportFormatter extends Formatter {
  private reportGenerator = new ReportGenerator()
  constructor(options: IFormatterOptions) {
    super(options)
    options.eventBroadcaster.on('envelope', (envelope: messages.Envelope) => {
      this.reportGenerator.handleMessage(envelope)
      if(envelope.testRunFinished){
        this.log(JSON.stringify(this.reportGenerator.getReport(), null, 2))
      }
    })
  }
}