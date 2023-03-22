import Formatter, { IFormatterStream } from '../formatter'
import { EventEmitter } from 'events'
import { EventDataCollector } from '../formatter/helpers'
import { ISupportCodeLibrary } from '../support_code_library_builder/types'
import { promisify } from 'util'
import { WriteStream as TtyWriteStream } from 'tty'
import FormatterBuilder from '../formatter/builder'
import fs from 'mz/fs'
import path from 'path'
import { IRunOptionsFormats } from './types'
import { ILogger } from '../logger'
import { mkdirp } from 'mkdirp'

export async function initializeFormatters({
  env,
  cwd,
  stdout,
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
  logger: ILogger
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

  const streamPromises: Promise<void>[] = []

  Object.entries(configuration.files).forEach(([target, type]) => {
    streamPromises.push(
      (async (target, type) => {
        const absoluteTarget = path.resolve(cwd, target)

        try {
          await mkdirp(path.dirname(absoluteTarget))
        } catch (error) {
          logger.warn('Failed to ensure directory for formatter target exists')
        }

        const stream: IFormatterStream = fs.createWriteStream(null, {
          fd: await fs.open(absoluteTarget, 'w'),
        })
        formatters.push(await initializeFormatter(stream, target, type))
      })(target, type)
    )
  })

  await Promise.all(streamPromises)

  return async function () {
    await Promise.all(formatters.map(async (f) => await f.finished()))
  }
}
