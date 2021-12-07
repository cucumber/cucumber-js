import { GherkinStreams } from '@cucumber/gherkin-streams'
import { IdGenerator } from '@cucumber/messages'
import { EventEmitter } from 'events'
import fs from 'mz/fs'
import path from 'path'
import { Writable } from 'stream'
import { WriteStream as TtyWriteStream } from 'tty'
import { pathToFileURL } from 'url'
import { promisify } from 'util'

import Formatter, { IFormatterStream } from '../formatter'
import FormatterBuilder from '../formatter/builder'
import { EventDataCollector } from '../formatter/helpers'
import HttpStream from '../formatter/http_stream'
import PickleFilter from '../pickle_filter'
import Runtime from '../runtime'
import ParallelRuntimeCoordinator from '../runtime/parallel/coordinator'
import supportCodeLibraryBuilder from '../support_code_library_builder'
import { ISupportCodeLibrary } from '../support_code_library_builder/types'
import { doesNotHaveValue } from '../value_checker'
import { IParsedArgvFormatOptions } from './argv_parser'
import ConfigurationBuilder, {
  IConfiguration,
  IConfigurationFormat,
} from './configuration_builder'
import {
  emitMetaMessage,
  emitSupportCodeMessages,
  getExpandedArgv,
  isJavaScript,
  parseGherkinMessageStream,
} from './helpers'
import * as I18n from './i18n'
import { validateInstall } from './install_validator'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { importer } = require('../importer')
const { uuid } = IdGenerator

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
    const formatters: Formatter[] = await Promise.all(
      formats.map(async ({ type, outputTo }) => {
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

  async getSupportCodeLibrary({
    newId,
    supportCodeRequiredModules,
    supportCodePaths,
  }: IGetSupportCodeLibraryRequest): Promise<ISupportCodeLibrary> {
    supportCodeRequiredModules.map((module) => require(module))
    supportCodeLibraryBuilder.reset(this.cwd, newId)
    for (const codePath of supportCodePaths) {
      if (supportCodeRequiredModules.length || !isJavaScript(codePath)) {
        require(codePath)
      } else {
        await importer(pathToFileURL(codePath))
      }
    }
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
    const newId = uuid()
    const supportCodeLibrary = await this.getSupportCodeLibrary({
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
        relativeTo: this.cwd,
      }
    )
    let pickleIds: string[] = []

    if (configuration.featurePaths.length > 0) {
      pickleIds = await parseGherkinMessageStream({
        cwd: this.cwd,
        eventBroadcaster,
        eventDataCollector,
        gherkinMessageStream,
        order: configuration.order,
        pickleFilter: new PickleFilter(configuration.pickleFilterOptions),
      })
    }
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
        newId,
        pickleIds,
        supportCodeLibrary,
        supportCodePaths: configuration.supportCodePaths,
        supportCodeRequiredModules: configuration.supportCodeRequiredModules,
      })
      success = await parallelRuntimeCoordinator.run(configuration.parallel)
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
