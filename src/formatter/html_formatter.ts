import Formatter, { IFormatterOptions } from '.'
import * as messages from '@cucumber/messages'
import resolvePkg from 'resolve-pkg'
import CucumberHtmlStream from '@cucumber/html-formatter'
import { finished } from 'stream'
import { promisify } from 'util'

export default class HtmlFormatter extends Formatter {
  private readonly _htmlStream: CucumberHtmlStream
  public static readonly documentation: string = 'Outputs HTML report'

  constructor(options: IFormatterOptions) {
    super(options)
    this._htmlStream = new CucumberHtmlStream(
      resolvePkg('@cucumber/html-formatter', { cwd: __dirname }) +
        '/dist/main.css',
      resolvePkg('@cucumber/html-formatter', { cwd: __dirname }) +
        '/dist/main.js'
    )
    options.eventBroadcaster.on('envelope', (envelope: messages.Envelope) => {
      this._htmlStream.write(envelope)
    })
    this._htmlStream.on('data', (chunk) => this.log(chunk))
  }

  async finished(): Promise<void> {
    this._htmlStream.end()
    await promisify(finished)(this._htmlStream)
    await super.finished()
  }
}
