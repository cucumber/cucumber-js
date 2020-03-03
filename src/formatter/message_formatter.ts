import Formatter from '.'

export default class MessageFormatter extends Formatter {
  constructor(options) {
    super(options)
    options.eventBroadcaster.on('envelope', envelope =>
      this.log(JSON.stringify(envelope.toJSON()) + '\n')
    )
  }
}
