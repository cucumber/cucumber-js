import Formatter, { IFormatterStream } from '../formatter'
import { EventEmitter } from 'events'
import { EventDataCollector } from '../formatter/helpers'
import { ISupportCodeLibrary } from '../support_code_library_builder/types'
import { promisify } from 'util'
import { WriteStream as TtyWriteStream } from 'tty'
import FormatterBuilder from '../formatter/builder'
import fs from 'mz/fs'
import path from 'path'
import { DEFAULT_CUCUMBER_PUBLISH_URL } from '../formatter/publish'
import HttpStream from '../formatter/http_stream'
import { Writable } from 'stream'
import { supportsColor } from 'supports-color'
import { IRunOptionsFormats } from './types'
import hasAnsi from 'has-ansi'
import stripAnsi from 'strip-ansi'

export async function initializeFormatters({
  env,
  cwd,
  stdout,
  stderr,
  logger,
  onStreamError,
  eventBroadcaster,
  eventDataCollector,
  configuration,
  supportCodeLibrary,
}: {
  env: NodeJS.ProcessEnv
  cwd: string
  stdout: IFormatterStream
  stderr: IFormatterStream
  logger: Console
  onStreamError: () => void
  eventBroadcaster: EventEmitter
  eventDataCollector: EventDataCollector
  configuration: IRunOptionsFormats
  supportCodeLibrary: ISupportCodeLibrary
}): Promise<() => Promise<void>> {
  async function initializeFormatter(
    stream: IFormatterStream,
    target: string,
    type: string
  ): Promise<Formatter> {
    stream.on('error', (error: Error) => {
      logger.error(error.message)
      onStreamError()
    })
    const typeOptions = {
      env,
      cwd,
      eventBroadcaster,
      eventDataCollector,
      log: stream.write.bind(stream),
      parsedArgvOptions: configuration.options,
      stream,
      cleanup:
        stream === stdout
          ? async () => await Promise.resolve()
          : promisify<any>(stream.end.bind(stream)),
      supportCodeLibrary,
    }
    if (type === 'progress-bar' && !(stream as TtyWriteStream).isTTY) {
      logger.warn(
        `Cannot use 'progress-bar' formatter for output to '${target}' as not a TTY. Switching to 'progress' formatter.`
      )
      type = 'progress'
    }
    return await FormatterBuilder.build(type, typeOptions)
  }

  const formatters: Formatter[] = []

  formatters.push(
    await initializeFormatter(stdout, 'stdout', configuration.stdout)
  )

  for (const [target, type] of Object.entries(configuration.files)) {
    const stream: IFormatterStream = fs.createWriteStream(null, {
      fd: await fs.open(path.resolve(cwd, target), 'w'),
    })
    formatters.push(await initializeFormatter(stream, target, type))
  }

  if (configuration.publish) {
    const { url = DEFAULT_CUCUMBER_PUBLISH_URL, token } = configuration.publish
    const headers: { [key: string]: string } = {}
    if (token !== undefined) {
      headers.Authorization = `Bearer ${token}`
    }
    const stream = new HttpStream(url, 'GET', headers)
    const readerStream = new Writable({
      objectMode: true,
      write: function (responseBody: string, encoding, writeCallback) {
        logger.error(sanitisePublishOutput(responseBody, stderr))
        writeCallback()
      },
    })
    stream.pipe(readerStream)
    formatters.push(await initializeFormatter(stream, url, 'message'))
  }

  return async function () {
    await Promise.all(formatters.map(async (f) => await f.finished()))
  }
}

/*
This is because the Cucumber Reports service returns a pre-formatted console message
including ANSI escapes, so if our stderr stream doesn't support those we need to
strip them back out. Ideally we should get structured data from the service and
compose the console message on this end.
 */
function sanitisePublishOutput(raw: string, stderr: IFormatterStream) {
  if (!supportsColor(stderr) && hasAnsi(raw)) {
    return stripAnsi(raw)
  }
  return raw
}
