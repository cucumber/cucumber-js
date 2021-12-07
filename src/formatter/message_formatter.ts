import * as messages from '@cucumber/messages'

import Formatter, { IFormatterOptions } from '.'

export default class MessageFormatter extends Formatter {
  public static readonly documentation: string = 'Outputs protobuf messages'
  constructor(options: IFormatterOptions) {
    super(options)
    options.eventBroadcaster.on('envelope', (envelope: messages.Envelope) =>
      this.log(JSON.stringify(envelope) + '\n')
    )
  }
}
