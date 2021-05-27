import { EventDataCollector } from '../formatter/helpers'
import {
  emitMetaMessage,
  emitSupportCodeMessages,
  getExpandedArgv,
  parseGherkinMessageStream,
} from './helpers'
import { validateInstall } from './install_validator'
import * as I18n from './i18n'
import ConfigurationBuilder, {
  IConfiguration,
  IConfigurationFormat,
} from './configuration_builder'
import { EventEmitter } from 'events'
import FormatterBuilder from '../formatter/builder'
import fs from 'mz/fs'
import path from 'path'
import PickleFilter from '../pickle_filter'
import bluebird from 'bluebird'
import ParallelRuntimeCoordinator from '../runtime/parallel/coordinator'
import Runtime from '../runtime'
import supportCodeLibraryBuilder from '../support_code_library_builder'
import { IdGenerator } from '@cucumber/messages'
import { IFormatterStream } from '../formatter'
import { WriteStream as TtyWriteStream } from 'tty'
import { doesNotHaveValue } from '../value_checker'
import { GherkinStreams } from '@cucumber/gherkin-streams'
import { ISupportCodeLibrary } from '../support_code_library_builder/types'
import { IParsedArgvFormatOptions } from './argv_parser'
import HttpStream from '../formatter/http_stream'
import { Writable } from 'stream'

const { incrementing, uuid } = IdGenerator

export interface ICliRunResult {
  shouldExitImmediately: boolean
  success: boolean
}

interface IInitializeFormattersRequest {
  eventBroadcaster: EventEmitter
  eventDataCollector: EventDataCollector
  formatOptions: IParsedArgvFormatOptions
  formats: IConfigurationFormat[]
  supportCodeLibrary: ISupportCodeLibrary
}

interface IGetSupportCodeLibraryRequest {
  newId: IdGenerator.NewId
  supportCodeRequiredModules: string[]
  supportCodePaths: string[]
}

export default class Cli {
  private readonly argv: string[]
  private readonly cwd: string
  private readonly stdout: IFormatterStream

  constructor({
    argv,
    cwd,
    stdout,
  }: {
    argv: string[]
    cwd: string
    stdout: IFormatterStream
  }) {
    this.argv = argv
    this.cwd = cwd
    this.stdout = stdout
  }

  async getConfiguration(): Promise<IConfiguration> {
    const fullArgv = await getExpandedArgv({
      argv: this.argv,
      cwd: this.cwd,
    })
    return await ConfigurationBuilder.build({
      argv: fullArgv,
      cwd: this.cwd,
    })
  }

  async initializeFormatters({
    eventBroadcaster,
    eventDataCollector,
    formatOptions,
    formats,
    supportCodeLibrary,
  }: IInitializeFormattersRequest): Promise<() => Promise<void>> {
    const formatters = await bluebird.map(
      formats,
      async ({ type, outputTo }) => {
        let stream: IFormatterStream = this.stdout
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
            const fd = await fs.open(path.resolve(this.cwd, outputTo), 'w')
            stream = fs.createWriteStream(null, { fd })
          }
        }

        stream.on('error', (error) => {
          console.error(error.message)
          process.exit(1)
        })

        const typeOptions = {
          cwd: this.cwd,
          eventBroadcaster,
          eventDataCollector,
          log: stream.write.bind(stream),
          parsedArgvOptions: formatOptions,
          stream,
          cleanup:
            stream === this.stdout
              ? async () => await Promise.resolve()
              : bluebird.promisify(stream.end.bind(stream)),
          supportCodeLibrary,
        }
        if (doesNotHaveValue(formatOptions.colorsEnabled)) {
          typeOptions.parsedArgvOptions.colorsEnabled = (stream as TtyWriteStream).isTTY
        }
        if (type === 'progress-bar' && !(stream as TtyWriteStream).isTTY) {
          const outputToName = outputTo === '' ? 'stdout' : outputTo
          console.warn(
            `Cannot use 'progress-bar' formatter for output to '${outputToName}' as not a TTY. Switching to 'progress' formatter.`
          )
          type = 'progress'
        }
        return FormatterBuilder.build(type, typeOptions)
      }
    )
    return async function () {
      await bluebird.each(formatters, async (formatter) => {
        await formatter.finished()
      })
    }
  }

  getSupportCodeLibrary({
    newId,
    supportCodeRequiredModules,
    supportCodePaths,
  }: IGetSupportCodeLibraryRequest): ISupportCodeLibrary {
    supportCodeRequiredModules.map((module) => require(module))
    supportCodeLibraryBuilder.reset(this.cwd, newId)
    supportCodePaths.forEach((codePath) => {
      try {
        require(codePath)
      } catch (e) {
        console.error(e.stack)
        console.error('codepath: ' + codePath)
      }
    })
    return supportCodeLibraryBuilder.finalize()
  }

  async run(): Promise<ICliRunResult> {
    await validateInstall(this.cwd)
    const configuration = await this.getConfiguration()
    if (configuration.listI18nLanguages) {
      this.stdout.write(I18n.getLanguages())
      return { shouldExitImmediately: true, success: true }
    }
    if (configuration.listI18nKeywordsFor !== '') {
      this.stdout.write(I18n.getKeywords(configuration.listI18nKeywordsFor))
      return { shouldExitImmediately: true, success: true }
    }
    const newId =
      configuration.predictableIds && configuration.parallel <= 1
        ? incrementing()
        : uuid()
    const supportCodeLibrary = this.getSupportCodeLibrary({
      newId,
      supportCodePaths: configuration.supportCodePaths,
      supportCodeRequiredModules: configuration.supportCodeRequiredModules,
    })
    const eventBroadcaster = new EventEmitter()
    const eventDataCollector = new EventDataCollector(eventBroadcaster)
    const cleanup = await this.initializeFormatters({
      eventBroadcaster,
      eventDataCollector,
      formatOptions: configuration.formatOptions,
      formats: configuration.formats,
      supportCodeLibrary,
    })
    await emitMetaMessage(eventBroadcaster)
    const gherkinMessageStream = GherkinStreams.fromPaths(
      configuration.featurePaths,
      {
        defaultDialect: configuration.featureDefaultLanguage,
        newId,
      }
    )
    const pickleIds = await parseGherkinMessageStream({
      cwd: this.cwd,
      eventBroadcaster,
      eventDataCollector,
      gherkinMessageStream,
      order: configuration.order,
      pickleFilter: new PickleFilter(configuration.pickleFilterOptions),
    })
    emitSupportCodeMessages({
      eventBroadcaster,
      supportCodeLibrary,
      newId,
    })
    let success
    if (configuration.parallel > 1) {
      const parallelRuntimeCoordinator = new ParallelRuntimeCoordinator({
        cwd: this.cwd,
        eventBroadcaster,
        eventDataCollector,
        options: configuration.runtimeOptions,
        pickleIds,
        supportCodeLibrary,
        supportCodePaths: configuration.supportCodePaths,
        supportCodeRequiredModules: configuration.supportCodeRequiredModules,
      })
      await new Promise<void>((resolve) => {
        parallelRuntimeCoordinator.run(configuration.parallel, (s) => {
          success = s
          resolve()
        })
      })
    } else {
      const runtime = new Runtime({
        eventBroadcaster,
        eventDataCollector,
        options: configuration.runtimeOptions,
        newId,
        pickleIds,
        supportCodeLibrary,
      })
      success = await runtime.start()
    }
    await cleanup()
    return {
      shouldExitImmediately: configuration.shouldExitImmediately,
      success,
    }
  }
}
