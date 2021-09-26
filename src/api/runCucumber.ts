import { IParsedArgvFormatOptions } from '../cli/argv_parser'
import { ISupportCodeLibrary } from '../support_code_library_builder/types'
import Formatter, { IFormatterStream } from '../formatter'
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
import { IConfigurationFormat } from '../cli/configuration_builder'
import { GherkinStreams } from '@cucumber/gherkin-streams'
import PickleFilter from '../pickle_filter'
import Runtime from '../runtime'
import { IRunConfiguration } from '../configuration'
import glob from 'glob'
import { IRunResult } from './types'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { importer } = require('../importer')

export async function runCucumber(
  configuration: IRunConfiguration,
  environment?: {
    cwd: string
    stdout: IFormatterStream
  }
): Promise<IRunResult> {
  const { cwd, stdout } = environment
  const newId = IdGenerator.uuid()

  const unexpandedFeaturePaths = await getUnexpandedFeaturePaths(
    cwd,
    configuration.features?.paths
  )
  const featurePaths: string[] = await expandFeaturePaths(
    cwd,
    unexpandedFeaturePaths
  )

  let supportCodeLibrary
  if ('World' in configuration.support) {
    supportCodeLibrary = configuration.support
  } else {
    let unexpandedSupportCodePaths = configuration.support.paths
    if (unexpandedSupportCodePaths.length === 0) {
      unexpandedSupportCodePaths = getFeatureDirectoryPaths(cwd, featurePaths)
    }
    const supportCodePaths = await expandPaths(
      cwd,
      unexpandedSupportCodePaths,
      '.@(js|mjs)'
    )
    supportCodeLibrary = await getSupportCodeLibrary({
      cwd,
      newId,
      supportCodePaths,
      supportCodeRequiredModules: configuration.support.transpileWith,
    })
  }

  const eventBroadcaster = new EventEmitter()
  const eventDataCollector = new EventDataCollector(eventBroadcaster)

  const cleanup = await initializeFormatters({
    cwd,
    stdout,
    eventBroadcaster,
    eventDataCollector,
    formatOptions: configuration.formats?.options ?? {},
    formats: [
      { type: configuration.formats?.stdout ?? 'progress', outputTo: '' },
    ],
    supportCodeLibrary,
  })
  await emitMetaMessage(eventBroadcaster)

  const gherkinMessageStream = GherkinStreams.fromPaths(featurePaths, {
    defaultDialect: configuration.features?.defaultDialect,
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
      order: 'defined', // TODO from --order
      pickleFilter: new PickleFilter({
        cwd,
        featurePaths: unexpandedFeaturePaths,
        names: configuration.filters?.name,
        tagExpression: configuration.filters?.tagExpression,
      }),
    })
  }
  emitSupportCodeMessages({
    eventBroadcaster,
    supportCodeLibrary,
    newId,
  })

  const runtime = new Runtime({
    eventBroadcaster,
    eventDataCollector,
    options: {
      dryRun: configuration.runtime?.dryRun,
      failFast: configuration.runtime?.failFast,
      filterStacktraces: configuration.runtime?.filterStacktraces,
      predictableIds: false,
      retry: configuration.runtime?.retry?.count ?? 0,
      retryTagFilter: configuration.runtime?.retry?.tagExpression,
      strict: configuration.runtime?.strict,
      worldParameters: configuration.runtime?.worldParameters,
    },
    newId,
    pickleIds,
    supportCodeLibrary,
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
  formatOptions,
  formats,
  supportCodeLibrary,
}: {
  cwd: string
  stdout: IFormatterStream
  eventBroadcaster: EventEmitter
  eventDataCollector: EventDataCollector
  formatOptions: IParsedArgvFormatOptions
  formats: IConfigurationFormat[]
  supportCodeLibrary: ISupportCodeLibrary
}): Promise<() => Promise<void>> {
  const formatters: Formatter[] = await Promise.all(
    formats.map(async ({ type, outputTo }) => {
      let stream: IFormatterStream = stdout
      if (outputTo !== '') {
        if (outputTo.match(/^https?:\/\//) !== null) {
          const headers: { [key: string]: string } = {}
          if (process.env.CUCUMBER_PUBLISH_TOKEN !== undefined) {
            headers.Authorization = `Bearer ${process.env.CUCUMBER_PUBLISH_TOKEN}`
          }

          stream = new HttpStream(outputTo, 'GET', headers)
          const readerStream = new Writable({
            objectMode: true,
            write: function (responseBody: string, encoding, writeCallback) {
              console.error(responseBody)
              writeCallback()
            },
          })
          stream.pipe(readerStream)
        } else {
          const fd = await fs.open(path.resolve(cwd, outputTo), 'w')
          stream = fs.createWriteStream(null, { fd })
        }
      }

      stream.on('error', (error) => {
        console.error(error.message)
        process.exit(1)
      })

      const typeOptions = {
        cwd,
        eventBroadcaster,
        eventDataCollector,
        log: stream.write.bind(stream),
        parsedArgvOptions: formatOptions,
        stream,
        cleanup:
          stream === stdout
            ? async () => await Promise.resolve()
            : promisify<any>(stream.end.bind(stream)),
        supportCodeLibrary,
      }
      if (doesNotHaveValue(formatOptions.colorsEnabled)) {
        typeOptions.parsedArgvOptions.colorsEnabled = (
          stream as TtyWriteStream
        ).isTTY
      }
      if (type === 'progress-bar' && !(stream as TtyWriteStream).isTTY) {
        const outputToName = outputTo === '' ? 'stdout' : outputTo
        console.warn(
          `Cannot use 'progress-bar' formatter for output to '${outputToName}' as not a TTY. Switching to 'progress' formatter.`
        )
        type = 'progress'
      }
      return await FormatterBuilder.build(type, typeOptions)
    })
  )
  return async function () {
    await Promise.all(formatters.map(async (f) => await f.finished()))
  }
}

async function expandPaths(
  cwd: string,
  unexpandedPaths: string[],
  defaultExtension: string
): Promise<string[]> {
  const expandedPaths = await Promise.all(
    unexpandedPaths.map(async (unexpandedPath) => {
      const matches = await promisify(glob)(unexpandedPath, {
        absolute: true,
        cwd,
      })
      const expanded = await Promise.all(
        matches.map(async (match) => {
          if (path.extname(match) === '') {
            return await promisify(glob)(`${match}/**/*${defaultExtension}`)
          }
          return [match]
        })
      )
      return expanded.flat()
    })
  )
  return expandedPaths.flat().map((x) => path.normalize(x))
}

async function getUnexpandedFeaturePaths(
  cwd: string,
  args: string[]
): Promise<string[]> {
  if (args.length > 0) {
    const nestedFeaturePaths = await Promise.all(
      args.map(async (arg) => {
        const filename = path.basename(arg)
        if (filename[0] === '@') {
          const filePath = path.join(cwd, arg)
          const content = await fs.readFile(filePath, 'utf8')
          return content.split('\n').map((x) => x.trim())
        }
        return [arg]
      })
    )
    const featurePaths = nestedFeaturePaths.flat()
    if (featurePaths.length > 0) {
      return featurePaths.filter((x) => x !== '')
    }
  }
  return ['features/**/*.{feature,feature.md}']
}

function getFeatureDirectoryPaths(
  cwd: string,
  featurePaths: string[]
): string[] {
  const featureDirs = featurePaths.map((featurePath) => {
    let featureDir = path.dirname(featurePath)
    let childDir: string
    let parentDir = featureDir
    while (childDir !== parentDir) {
      childDir = parentDir
      parentDir = path.dirname(childDir)
      if (path.basename(parentDir) === 'features') {
        featureDir = parentDir
        break
      }
    }
    return path.relative(cwd, featureDir)
  })
  return [...new Set(featureDirs)]
}

async function expandFeaturePaths(
  cwd: string,
  featurePaths: string[]
): Promise<string[]> {
  featurePaths = featurePaths.map((p) => p.replace(/(:\d+)*$/g, '')) // Strip line numbers
  featurePaths = [...new Set(featurePaths)] // Deduplicate the feature files
  return await expandPaths(cwd, featurePaths, '.feature')
}
