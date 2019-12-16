import { EventDataCollector } from '../formatter/helpers'
import { getExpandedArgv, loadPicklesFromFilesystem } from './helpers'
import { validateInstall } from './install_validator'
import * as I18n from './i18n'
import ConfigurationBuilder from './configuration_builder'
import EventEmitter from 'events'
import FormatterBuilder from '../formatter/builder'
import fs from 'mz/fs'
import path from 'path'
import PickleFilter from '../pickle_filter'
import Promise from 'bluebird'
import ParallelRuntimeMaster from '../runtime/parallel/master'
import Runtime from '../runtime'
import supportCodeLibraryBuilder from '../support_code_library_builder'
import { IdGenerator } from 'cucumber-messages'

const { incrementing, uuid } = IdGenerator

export default class Cli {
  constructor({ argv, cwd, stdout }) {
    this.argv = argv
    this.cwd = cwd
    this.stdout = stdout
  }

  async getConfiguration() {
    const fullArgv = await getExpandedArgv({ argv: this.argv, cwd: this.cwd })
    return ConfigurationBuilder.build({ argv: fullArgv, cwd: this.cwd })
  }

  async initializeFormatters({
    eventBroadcaster,
    eventDataCollector,
    formatOptions,
    formats,
    supportCodeLibrary,
  }) {
    const streamsToClose = []
    await Promise.map(formats, async ({ type, outputTo }) => {
      let stream = this.stdout
      if (outputTo) {
        const fd = await fs.open(path.resolve(this.cwd, outputTo), 'w')
        stream = fs.createWriteStream(null, { fd })
        streamsToClose.push(stream)
      }
      const typeOptions = {
        eventBroadcaster,
        eventDataCollector,
        log: ::stream.write,
        stream,
        supportCodeLibrary,
        ...formatOptions,
      }
      if (
        !Object.prototype.hasOwnProperty.call(formatOptions, 'colorsEnabled')
      ) {
        typeOptions.colorsEnabled = !!stream.isTTY
      }
      if (type === 'progress-bar' && !stream.isTTY) {
        console.warn(
          `Cannot use 'progress-bar' formatter for output to '${outputTo ||
            'stdout'}' as not a TTY. Switching to 'progress' formatter.`
        )
        type = 'progress'
      }
      return FormatterBuilder.build(type, typeOptions)
    })
    return function() {
      return Promise.each(streamsToClose, stream =>
        Promise.promisify(::stream.end)()
      )
    }
  }

  getSupportCodeLibrary({
    newId,
    supportCodeRequiredModules,
    supportCodePaths,
  }) {
    supportCodeRequiredModules.map(module => require(module))
    supportCodeLibraryBuilder.reset(this.cwd, newId)
    supportCodePaths.forEach(codePath => require(codePath))
    return supportCodeLibraryBuilder.finalize()
  }

  async run() {
    await validateInstall(this.cwd)
    const configuration = await this.getConfiguration()
    if (configuration.listI18nLanguages) {
      this.stdout.write(I18n.getLanguages())
      return { success: true }
    }
    if (configuration.listI18nKeywordsFor) {
      this.stdout.write(I18n.getKeywords(configuration.listI18nKeywordsFor))
      return { success: true }
    }
    const newId =
      configuration.predictableIds && !configuration.parallel
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
    const pickleIds = await loadPicklesFromFilesystem({
      cwd: this.cwd,
      eventBroadcaster,
      eventDataCollector,
      featureDefaultLanguage: configuration.featureDefaultLanguage,
      featurePaths: configuration.featurePaths,
      newId,
      order: configuration.order,
      pickleFilter: new PickleFilter(configuration.pickleFilterOptions),
    })
    let success
    if (configuration.parallel) {
      const parallelRuntimeMaster = new ParallelRuntimeMaster({
        cwd: this.cwd,
        eventBroadcaster,
        eventDataCollector,
        options: configuration.runtimeOptions,
        pickleIds,
        supportCodeLibrary,
        supportCodePaths: configuration.supportCodePaths,
        supportCodeRequiredModules: configuration.supportCodeRequiredModules,
      })
      await new Promise(resolve => {
        parallelRuntimeMaster.run(configuration.parallel, s => {
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
