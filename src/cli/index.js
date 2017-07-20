import { validateInstall } from './install_validator'
import { getExpandedArgv, getTestCases } from './helpers'
import ConfigurationBuilder from './configuration_builder'
import FormatterBuilder from '../formatter/builder'
import fs from 'mz/fs'
import path from 'path'
import Promise from 'bluebird'
import Runtime from '../runtime'
import SupportCodeFns from '../support_code_fns'
import SupportCodeLibraryBuilder from '../support_code_library/builder'
import * as I18n from './i18n'
import EventEmitter from 'events'
import EventDataCollector from '../event_data_collector'

export default class Cli {
  constructor({ argv, cwd, stdout }) {
    this.argv = argv
    this.cwd = cwd
    this.stdout = stdout
  }

  async getConfiguration() {
    const fullArgv = await getExpandedArgv({ argv: this.argv, cwd: this.cwd })
    return await ConfigurationBuilder.build({ argv: fullArgv, cwd: this.cwd })
  }

  async initializeFormatters({
    eventBroadcaster,
    formatOptions,
    formats,
    supportCodeLibrary
  }) {
    const streamsToClose = []
    const eventDataCollector = new EventDataCollector(eventBroadcaster)
    await Promise.map(formats, async ({ type, outputTo }) => {
      let stream = this.stdout
      if (outputTo) {
        let fd = await fs.open(path.join(this.cwd, outputTo), 'w')
        stream = fs.createWriteStream(null, { fd })
        streamsToClose.push(stream)
      }
      const typeOptions = {
        eventBroadcaster,
        eventDataCollector,
        log: ::stream.write,
        stream,
        supportCodeLibrary,
        ...formatOptions
      }
      return FormatterBuilder.build(type, typeOptions)
    })
    return function() {
      return Promise.each(streamsToClose, stream =>
        Promise.promisify(::stream.end)()
      )
    }
  }

  getSupportCodeLibrary(supportCodePaths) {
    SupportCodeFns.reset()
    supportCodePaths.forEach(codePath => require(codePath))
    return SupportCodeLibraryBuilder.build({
      cwd: this.cwd,
      fns: SupportCodeFns.get()
    })
  }

  async run() {
    await validateInstall(this.cwd)
    const configuration = await this.getConfiguration()
    if (configuration.listI18nLanguages) {
      this.stdout.write(I18n.getLanguages())
      return true
    }
    if (configuration.listI18nKeywordsFor) {
      this.stdout.write(I18n.getKeywords(configuration.listI18nKeywordsFor))
      return true
    }
    const supportCodeLibrary = this.getSupportCodeLibrary(
      configuration.supportCodePaths
    )
    const eventBroadcaster = new EventEmitter()
    const cleanup = await this.initializeFormatters({
      eventBroadcaster,
      formatOptions: configuration.formatOptions,
      formats: configuration.formats,
      supportCodeLibrary
    })
    const testCases = await getTestCases({
      cwd: this.cwd,
      eventBroadcaster,
      featurePaths: configuration.featurePaths,
      pickleFilterOptions: configuration.pickleFilterOptions
    })
    const runtime = new Runtime({
      eventBroadcaster,
      options: configuration.runtimeOptions,
      supportCodeLibrary,
      testCases
    })
    const result = await runtime.start()
    await cleanup()
    return result
  }
}
