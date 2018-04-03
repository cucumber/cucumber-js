import { EventDataCollector } from '../formatter/helpers'
import { getExpandedArgv, getTestCasesFromFilesystem } from './helpers'
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
    formatOptions,
    formats,
    supportCodeLibrary,
  }) {
    const streamsToClose = []
    const eventDataCollector = new EventDataCollector(eventBroadcaster)
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
      return FormatterBuilder.build(type, typeOptions)
    })
    return function() {
      return Promise.each(streamsToClose, stream =>
        Promise.promisify(::stream.end)()
      )
    }
  }

  getSupportCodeLibrary({ supportCodeRequiredModules, supportCodePaths }) {
    supportCodeRequiredModules.map(module => require(module))
    supportCodeLibraryBuilder.reset(this.cwd)
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
    const supportCodeLibrary = this.getSupportCodeLibrary(configuration)
    const eventBroadcaster = new EventEmitter()
    const cleanup = await this.initializeFormatters({
      eventBroadcaster,
      formatOptions: configuration.formatOptions,
      formats: configuration.formats,
      supportCodeLibrary,
    })
    const testCases = await getTestCasesFromFilesystem({
      cwd: this.cwd,
      eventBroadcaster,
      featureDefaultLanguage: configuration.featureDefaultLanguage,
      featurePaths: configuration.featurePaths,
      order: configuration.order,
      pickleFilter: new PickleFilter(configuration.pickleFilterOptions),
    })
    let success
    if (configuration.parallel) {
      const parallelRuntimeMaster = new ParallelRuntimeMaster({
        eventBroadcaster,
        options: configuration.runtimeOptions,
        supportCodePaths: configuration.supportCodePaths,
        supportCodeRequiredModules: configuration.supportCodeRequiredModules,
        testCases,
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
        options: configuration.runtimeOptions,
        supportCodeLibrary,
        testCases,
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
