import Formatter, { IFormatterOptions } from '.'
import * as messages from '@cucumber/messages'
import resolvePkg from 'resolve-pkg'
import CucumberHtmlStream from '@cucumber/html-formatter'
import { doesHaveValue } from '../value_checker'
import { finished } from 'stream'
import { promisify } from 'util'

export default class HtmlFormatter extends Formatter {
  private readonly _finished: Promise<void>

  constructor(options: IFormatterOptions) {
    super(options)
    const cucumberHtmlStream = new CucumberHtmlStream(
      resolvePkg('@cucumber/html-formatter', { cwd: __dirname }) +
        '/dist/cucumber-react.css',
      resolvePkg('@cucumber/html-formatter', { cwd: __dirname }) +
        '/dist/main.js'
    )
    options.eventBroadcaster.on('envelope', (envelope: messages.Envelope) => {
      cucumberHtmlStream.write(envelope)
      if (doesHaveValue(envelope.testRunFinished)) {
        cucumberHtmlStream.end()
      }
    })
    cucumberHtmlStream.on('data', (chunk) => this.log(chunk))
    this._finished = promisify(finished)(cucumberHtmlStream)
  }

  async finished(): Promise<void> {
    await this._finished
    await super.finished()
  }
}
