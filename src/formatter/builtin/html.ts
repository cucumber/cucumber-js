import { promisify } from 'node:util'
import { finished } from 'node:stream'
import CucumberHtmlStream from '@cucumber/html-formatter'
import resolvePkg from 'resolve-pkg'
import { FormatterPlugin } from '../../plugin'

interface Options {
  externalAttachments?: true
}

export default {
  type: 'formatter',
  formatter({ on, logger, write, directory }) {
    logger.warn('Directory for HTML formatter: ' + directory)
    const htmlStream = new CucumberHtmlStream(
      resolvePkg('@cucumber/html-formatter', { cwd: __dirname }) +
        '/dist/main.css',
      resolvePkg('@cucumber/html-formatter', { cwd: __dirname }) +
        '/dist/main.js'
    )
    on('message', (message) => htmlStream.write(message))
    htmlStream.on('data', (chunk) => write(chunk))

    return async () => {
      htmlStream.end()
      await promisify(finished)(htmlStream)
    }
  },
  documentation: 'Outputs a HTML report',
  optionsKey: 'html',
} satisfies FormatterPlugin<Options>
