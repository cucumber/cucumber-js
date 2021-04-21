import Formatter, { IFormatterOptions } from '.'
import messages from '@cucumber/messages'

export default class MessageFormatter extends Formatter {
  constructor(options: IFormatterOptions) {
    super(options)
    options.eventBroadcaster.on('envelope', (envelope: messages.Envelope) =>
      this.log(JSON.stringify(JSON.stringify(envelope)) + '\n')
    )
  }
}
