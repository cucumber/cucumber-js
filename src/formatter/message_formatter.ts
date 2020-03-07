import Formatter, { IFormatterOptions } from '.'
import { messages } from 'cucumber-messages'
import IEnvelope = messages.IEnvelope

export default class MessageFormatter extends Formatter {
  constructor(options: IFormatterOptions) {
    super(options)
    options.eventBroadcaster.on('envelope', (envelope: IEnvelope) =>
      this.log(messages.Envelope.encodeDelimited(envelope).finish())
    )
  }
}
