import { Writable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { stripVTControlCharacters } from 'node:util'
import { mkdtemp, stat } from 'node:fs/promises'
import path from 'node:path'
import { tmpdir } from 'node:os'
import { createReadStream, createWriteStream } from 'node:fs'
import { createGzip } from 'node:zlib'
import { supportsColor } from 'supports-color'
import hasAnsi from 'has-ansi'
import { InternalPlugin } from '../plugin'
import { IPublishConfig } from './types'

const DEFAULT_CUCUMBER_PUBLISH_URL = 'https://messages.cucumber.io/api/reports'

export const publishPlugin: InternalPlugin<IPublishConfig | false> = {
  type: 'plugin',
  coordinator: async ({ on, logger, options, environment }) => {
    if (!options) {
      return undefined
    }
    const { url = DEFAULT_CUCUMBER_PUBLISH_URL, token } = options
    const headers: { [key: string]: string } = {}
    if (token !== undefined) {
      headers.Authorization = `Bearer ${token}`
    }
    const touchResponse = await fetch(url, { headers })
    const banner = await touchResponse.text()

    if (!touchResponse.ok) {
      return () => {
        if (touchResponse.status < 500) {
          environment.stderr.write(
            sanitisePublishOutput(banner, environment.stderr) + '\n'
          )
        } else {
          logger.error(
            `Failed to publish report to ${new URL(url).origin} with status ${
              touchResponse.status
            }`
          )
          logger.debug(touchResponse)
        }
      }
    }

    const uploadUrl = touchResponse.headers.get('Location')
    const tempDir = await mkdtemp(path.join(tmpdir(), `cucumber-js-publish-`))
    const tempFilePath = path.join(tempDir, 'envelopes.jsonl.gz')
    const writeStream = createGzip()
    const finishedWriting = pipeline(
      writeStream,
      createWriteStream(tempFilePath)
    )
    on('message', (value) => writeStream.write(JSON.stringify(value) + '\n'))

    return () => {
      return new Promise<void>((resolve) => {
        writeStream.end(async () => {
          await finishedWriting
          const stats = await stat(tempFilePath)
          const contentLength = stats.size.toString()
          logger.debug(
            'Uploading envelopes to Cucumber Reports with content length:',
            contentLength
          )
          const uploadResponse = await fetch(uploadUrl, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/jsonl',
              'Content-Encoding': 'gzip',
              'Content-Length': contentLength,
            },
            body: createReadStream(tempFilePath, { encoding: 'utf-8' }),
            duplex: 'half',
          })
          if (uploadResponse.ok) {
            environment.stderr.write(
              sanitisePublishOutput(banner, environment.stderr) + '\n'
            )
          } else {
            logger.error(
              `Failed to upload report to ${
                new URL(uploadUrl).origin
              } with status ${uploadResponse.status}`
            )
            logger.debug(await uploadResponse.text())
          }
          resolve()
        })
      })
    }
  },
}

/*
This is because the Cucumber Reports service returns a pre-formatted console message
including ANSI escapes, so if our stderr stream doesn't support those we need to
strip them back out. Ideally we should get structured data from the service and
compose the console message on this end.
 */
function sanitisePublishOutput(raw: string, stderr: Writable) {
  if (!supportsColor(stderr) && hasAnsi(raw)) {
    return stripVTControlCharacters(raw)
  }
  return raw
}
