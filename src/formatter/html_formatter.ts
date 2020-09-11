import Formatter, { IFormatterOptions } from '.'
import { messages } from '@cucumber/messages'
import resolvePkg from 'resolve-pkg'
import CucumberHtmlStream from '@cucumber/html-formatter'
import { doesHaveValue } from '../value_checker'

export default class HtmlFormatter extends Formatter {
  constructor(options: IFormatterOptions) {
    super(options)
    const cucumberHtmlStream = new CucumberHtmlStream(
      resolvePkg('@cucumber/react', { cwd: __dirname }) +
        '/dist/src/styles/cucumber-react.css',
      resolvePkg('@cucumber/html-formatter', { cwd: __dirname }) +
        '/dist/main.js'
    )
    options.eventBroadcaster.on('envelope', (envelope: messages.Envelope) => {
      cucumberHtmlStream.write(envelope)
      if (doesHaveValue(envelope.testRunFinished)) {
        cucumberHtmlStream.end()
      }
    })
    cucumberHtmlStream.pipe(this.stream)
  }
}
