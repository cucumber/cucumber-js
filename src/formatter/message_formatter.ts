import Formatter from '.'
import { messages } from 'cucumber-messages'

export default class MessageFormatter extends Formatter {
  constructor(options) {
    super(options)
    options.eventBroadcaster.on('envelope', envelope =>
      this.log(messages.Envelope.encodeDelimited(envelope).finish())
    )
  }
}
