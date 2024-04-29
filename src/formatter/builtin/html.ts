import { promisify } from 'node:util'
import { finished } from 'node:stream'
import CucumberHtmlStream from '@cucumber/html-formatter'
import resolvePkg from 'resolve-pkg'
import { FormatterPlugin } from '../../plugin'

export default {
  type: 'formatter',
  formatter({ on, write }) {
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
} satisfies FormatterPlugin
