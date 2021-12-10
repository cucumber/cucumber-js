import Formatter, { IFormatterStream } from '../formatter'
import { EventEmitter } from 'events'
import { EventDataCollector } from '../formatter/helpers'
import { ISupportCodeLibrary } from '../support_code_library_builder/types'
import { promisify } from 'util'
import { doesNotHaveValue } from '../value_checker'
import { WriteStream as TtyWriteStream } from 'tty'
import FormatterBuilder from '../formatter/builder'
import fs from 'mz/fs'
import path from 'path'
import { DEFAULT_CUCUMBER_PUBLISH_URL } from '../formatter/publish'
import HttpStream from '../formatter/http_stream'
import { Writable } from 'stream'
import { IFormatterConfiguration } from '../configuration'

export async function initializeFormatters({
  cwd,
  stdout,
  eventBroadcaster,
  eventDataCollector,
  configuration = {},
  supportCodeLibrary,
}: {
  cwd: string
  stdout: IFormatterStream
  eventBroadcaster: EventEmitter
  eventDataCollector: EventDataCollector
  configuration: IFormatterConfiguration
  supportCodeLibrary: ISupportCodeLibrary
}): Promise<() => Promise<void>> {
  async function initializeFormatter(
    stream: IFormatterStream,
    target: string,
    type: string
  ): Promise<Formatter> {
    stream.on('error', (error) => {
      console.error(error.message)
      process.exit(1)
    })
    const typeOptions = {
      cwd,
      eventBroadcaster,
      eventDataCollector,
      log: stream.write.bind(stream),
      parsedArgvOptions: configuration.options ?? {},
      stream,
      cleanup:
        stream === stdout
          ? async () => await Promise.resolve()
          : promisify<any>(stream.end.bind(stream)),
      supportCodeLibrary,
    }
    if (doesNotHaveValue(configuration.options?.colorsEnabled)) {
      typeOptions.parsedArgvOptions.colorsEnabled = (
        stream as TtyWriteStream
      ).isTTY
    }
    if (type === 'progress-bar' && !(stream as TtyWriteStream).isTTY) {
      console.warn(
        `Cannot use 'progress-bar' formatter for output to '${target}' as not a TTY. Switching to 'progress' formatter.`
      )
      type = 'progress'
    }
    return await FormatterBuilder.build(type, typeOptions)
  }

  const formatters: Formatter[] = []

  formatters.push(
    await initializeFormatter(
      stdout,
      'stdout',
      configuration.stdout ?? 'progress'
    )
  )

  if (configuration.files) {
    for (const [target, type] of Object.entries(configuration.files)) {
      const stream: IFormatterStream = fs.createWriteStream(null, {
        fd: await fs.open(path.resolve(cwd, target), 'w'),
      })
      formatters.push(await initializeFormatter(stream, target, type))
    }
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
        console.error(responseBody)
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
