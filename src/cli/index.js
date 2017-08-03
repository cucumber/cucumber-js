import { validateInstall } from './install_validator'
import { getExpandedArgv, getFeatures } from './helpers'
import ConfigurationBuilder from './configuration_builder'
import FormatterBuilder from '../formatter/builder'
import fs from 'mz/fs'
import path from 'path'
import Promise from 'bluebird'
import Runtime from '../runtime'
import ScenarioFilter from '../scenario_filter'
import SupportCodeFns from '../support_code_fns'
import SupportCodeLibraryBuilder from '../support_code_library/builder'
import * as I18n from './i18n'

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

  async getFormatters({ formatOptions, formats, supportCodeLibrary }) {
    const streamsToClose = []
    const formatters = await Promise.map(
      formats,
      async ({ type, outputTo }) => {
        let stream = this.stdout
        if (outputTo) {
          let fd = await fs.open(path.join(this.cwd, outputTo), 'w')
          stream = fs.createWriteStream(null, { fd })
          streamsToClose.push(stream)
        }
        const typeOptions = {
          log: ::stream.write,
          stream,
          supportCodeLibrary,
          ...formatOptions
        }
        return FormatterBuilder.build(type, typeOptions)
      }
    )
    const cleanup = function() {
      return Promise.each(streamsToClose, stream =>
        Promise.promisify(::stream.end)()
      )
    }
    return { cleanup, formatters }
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
    const scenarioFilter = new ScenarioFilter(
      configuration.scenarioFilterOptions
    )
    const [features, { cleanup, formatters }] = await Promise.all([
      getFeatures({
        cwd: this.cwd,
        featurePaths: configuration.featurePaths,
        scenarioFilter
      }),
      this.getFormatters({
        formatOptions: configuration.formatOptions,
        formats: configuration.formats,
        supportCodeLibrary
      })
    ])
    const runtime = new Runtime({
      features,
      listeners: formatters,
      options: configuration.runtimeOptions,
      supportCodeLibrary
    })
    const result = await runtime.start()
    await cleanup()
    return result
  }
}
