import * as messages from '@cucumber/messages'
import Formatter, { IFormatterOptions } from '.'
import ReportGenerator from './helpers/report_generator'
import ReportUploader from './helpers/uploader'

export default class BVTFormatter extends Formatter {
  private reportGenerator = new ReportGenerator()
  private uploader = new ReportUploader(this.reportGenerator)
  constructor(options: IFormatterOptions) {
    super(options)
    options.eventBroadcaster.on(
      'envelope',
      async (envelope: messages.Envelope) => {
        this.reportGenerator.handleMessage(envelope)
        if (envelope.testRunFinished) {
          const report = this.reportGenerator.getReport()
          // this.log(JSON.stringify(report, null, 2))

          await this.uploader.uploadRun(report)
        }
      }
    )
  }
}
