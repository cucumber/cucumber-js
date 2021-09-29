import { ISupportCodeLibrary } from '../support_code_library_builder/types'
import Formatter, {
  IFormatterConfiguration,
  IFormatterStream,
} from '../formatter'
import { IdGenerator } from '@cucumber/messages'
import supportCodeLibraryBuilder from '../support_code_library_builder'
import { pathToFileURL } from 'url'
import { EventEmitter } from 'events'
import { EventDataCollector } from '../formatter/helpers'
import {
  emitMetaMessage,
  emitSupportCodeMessages,
  parseGherkinMessageStream,
} from '../cli/helpers'
import HttpStream from '../formatter/http_stream'
import { Writable } from 'stream'
import fs from 'mz/fs'
import path from 'path'
import { promisify } from 'util'
import { doesNotHaveValue } from '../value_checker'
import { WriteStream as TtyWriteStream } from 'tty'
import FormatterBuilder from '../formatter/builder'
import { GherkinStreams } from '@cucumber/gherkin-streams'
import PickleFilter from '../pickle_filter'
import { IRunConfiguration } from '../configuration'
import { IRunResult } from './types'
import { DEFAULT_CUCUMBER_PUBLISH_URL } from '../formatter/publish'
import { resolvePaths } from './paths'
import { makeRuntime } from './runtime'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { importer } = require('../importer')

export async function runCucumber(
  configuration: IRunConfiguration,
  environment: {
    cwd: string
    stdout: IFormatterStream
    env: typeof process.env
  } = {
    cwd: process.cwd(),
    stdout: process.stdout,
    env: process.env,
  }
): Promise<IRunResult> {
  const { cwd, stdout } = environment
  const newId = configuration.predictableIds
    ? IdGenerator.incrementing()
    : IdGenerator.uuid()

  const { unexpandedFeaturePaths, featurePaths, supportCodePaths } =
    await resolvePaths(cwd, configuration)

  const supportCodeLibrary = await getSupportCodeLibrary({
    cwd,
    newId,
    supportCodePaths,
    supportCodeRequiredModules: configuration.support.transpileWith,
  })

  const eventBroadcaster = new EventEmitter()
  const eventDataCollector = new EventDataCollector(eventBroadcaster)

  const cleanup = await initializeFormatters({
    cwd,
    stdout,
    eventBroadcaster,
    eventDataCollector,
    configuration: configuration.formats,
    supportCodeLibrary,
  })
  await emitMetaMessage(eventBroadcaster)

  const gherkinMessageStream = GherkinStreams.fromPaths(featurePaths, {
    defaultDialect: configuration.sources?.defaultDialect,
    newId,
    relativeTo: cwd,
  })
  let pickleIds: string[] = []

  if (featurePaths.length > 0) {
    pickleIds = await parseGherkinMessageStream({
      cwd,
      eventBroadcaster,
      eventDataCollector,
      gherkinMessageStream,
      order: configuration.pickles?.order ?? 'defined',
      pickleFilter: new PickleFilter({
        cwd,
        featurePaths: unexpandedFeaturePaths,
        names: configuration.pickles?.names,
        tagExpression: configuration.pickles?.tagExpression,
      }),
    })
  }
  emitSupportCodeMessages({
    eventBroadcaster,
    supportCodeLibrary,
    newId,
  })

  const runtimeOptions = {
    dryRun: configuration.runtime?.dryRun,
    failFast: configuration.runtime?.failFast,
    filterStacktraces: configuration.runtime?.filterStacktraces,
    predictableIds: configuration.predictableIds,
    retry: configuration.runtime?.retry?.count ?? 0,
    retryTagFilter: configuration.runtime?.retry?.tagExpression,
    strict: configuration.runtime?.strict,
    worldParameters: configuration.runtime?.worldParameters,
  }
  const runtime = makeRuntime({
    cwd,
    eventBroadcaster,
    eventDataCollector,
    pickleIds,
    newId,
    supportCodeLibrary,
    supportCodePaths,
    supportCodeRequiredModules: configuration.support.transpileWith,
    options: runtimeOptions,
    parallel: configuration.runtime.parallel?.count ?? 0,
  })
  const success = await runtime.start()
  await cleanup()

  return {
    success,
    support: supportCodeLibrary,
  }
}

async function getSupportCodeLibrary({
  cwd,
  newId,
  supportCodeRequiredModules,
  supportCodePaths,
}: {
  cwd: string
  newId: IdGenerator.NewId
  supportCodeRequiredModules: string[]
  supportCodePaths: string[]
}): Promise<ISupportCodeLibrary> {
  supportCodeLibraryBuilder.reset(cwd, newId)
  supportCodeRequiredModules.map((module) => require(module))
  for (const codePath of supportCodePaths) {
    if (supportCodeRequiredModules.length) {
      require(codePath)
    } else {
      await importer(pathToFileURL(codePath))
    }
  }
  return supportCodeLibraryBuilder.finalize()
}

async function initializeFormatters({
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
    for (const [target, type] of configuration.files) {
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
