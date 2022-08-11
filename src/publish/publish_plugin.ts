import { Plugin } from '../plugin'
import HttpStream from './http_stream'
import { Writable } from 'stream'
import { supportsColor } from 'supports-color'
import hasAnsi from 'has-ansi'
import stripAnsi from 'strip-ansi'

const DEFAULT_CUCUMBER_PUBLISH_URL = 'https://messages.cucumber.io/api/reports'

export const publishPlugin: Plugin = async ({
  on,
  logger,
  configuration,
  environment,
}) => {
  if (!configuration.formats.publish) {
    return undefined
  }
  const { url = DEFAULT_CUCUMBER_PUBLISH_URL, token } =
    configuration.formats.publish
  const headers: { [key: string]: string } = {}
  if (token !== undefined) {
    headers.Authorization = `Bearer ${token}`
  }
  const stream = new HttpStream(url, 'GET', headers)
  const readerStream = new Writable({
    objectMode: true,
    write: function (responseBody: string, encoding, writeCallback) {
      environment.stderr.write(
        sanitisePublishOutput(responseBody, environment.stderr) + '\n'
      )
      writeCallback()
    },
  })
  stream.pipe(readerStream)
  stream.on('error', (error: Error) => logger.error(error.message))
  on('message', (value) => stream.write(JSON.stringify(value) + '\n'))
  return () => stream.end()
}
/*
This is because the Cucumber Reports service returns a pre-formatted console message
including ANSI escapes, so if our stderr stream doesn't support those we need to
strip them back out. Ideally we should get structured data from the service and
compose the console message on this end.
 */
function sanitisePublishOutput(raw: string, stderr: Writable) {
  if (!supportsColor(stderr) && hasAnsi(raw)) {
    return stripAnsi(raw)
  }
  return raw
}
