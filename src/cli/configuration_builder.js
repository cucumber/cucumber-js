import _ from 'lodash'
import ArgvParser from './argv_parser'
import fs from 'mz/fs'
import path from 'path'
import PathExpander from './path_expander'
import Promise from 'bluebird'

export default class ConfigurationBuilder {
  static async build(options) {
    const builder = new ConfigurationBuilder(options)
    return await builder.build()
  }

  constructor({ argv, cwd }) {
    this.cwd = cwd
    this.pathExpander = new PathExpander(cwd)

    const parsedArgv = ArgvParser.parse(argv)
    this.args = parsedArgv.args
    this.options = parsedArgv.options
  }

  async build() {
    const listI18nKeywordsFor = this.options.i18nKeywords
    const listI18nLanguages = !!this.options.i18nLanguages
    const unexpandedFeaturePaths = await this.getUnexpandedFeaturePaths()
    let featurePaths = []
    let supportCodePaths = []
    if (!listI18nKeywordsFor && !listI18nLanguages) {
      featurePaths = await this.expandFeaturePaths(unexpandedFeaturePaths)
      const featureDirectoryPaths = this.getFeatureDirectoryPaths(featurePaths)
      const unexpandedSupportCodePaths =
        this.options.require.length > 0
          ? this.options.require
          : featureDirectoryPaths
      supportCodePaths = await this.expandSupportCodePaths(
        unexpandedSupportCodePaths
      )
    }
    return {
      featurePaths,
      formats: this.getFormats(),
      formatOptions: this.getFormatOptions(),
      listI18nKeywordsFor,
      listI18nLanguages,
      profiles: this.options.profile,
      pickleFilterOptions: {
        featurePaths: unexpandedFeaturePaths,
        names: this.options.name,
        tagExpression: this.options.tags
      },
      runtimeOptions: {
        dryRun: !!this.options.dryRun,
        failFast: !!this.options.failFast,
        filterStacktraces: !this.options.backtrace,
        strict: !!this.options.strict,
        worldParameters: this.options.worldParameters
      },
      supportCodePaths
    }
  }

  async expandFeaturePaths(featurePaths) {
    featurePaths = featurePaths.map(p => p.replace(/(:\d+)*$/g, '')) // Strip line numbers
    return await this.pathExpander.expandPathsWithExtensions(featurePaths, [
      'feature'
    ])
  }

  getFeatureDirectoryPaths(featurePaths) {
    const featureDirs = featurePaths.map(featurePath => {
      let featureDir = path.dirname(featurePath)
      let childDir
      let parentDir = featureDir
      while (childDir !== parentDir) {
        childDir = parentDir
        parentDir = path.dirname(childDir)
        if (path.basename(parentDir) === 'features') {
          featureDir = parentDir
          break
        }
      }
      return path.relative(this.cwd, featureDir)
    })
    return _.uniq(featureDirs)
  }

  getFormatOptions() {
    const formatOptions = _.clone(this.options.formatOptions)
    formatOptions.cwd = this.cwd
    _.defaults(formatOptions, { colorsEnabled: true })
    return formatOptions
  }

  getFormats() {
    const mapping = { '': 'progress' }
    this.options.format.forEach(function(format) {
      const parts = format.split(':')
      const type = parts[0]
      const outputTo = parts.slice(1).join(':')
      mapping[outputTo] = type
    })
    return _.map(mapping, function(type, outputTo) {
      return { outputTo, type }
    })
  }

  async getUnexpandedFeaturePaths() {
    if (this.args.length > 0) {
      const nestedFeaturePaths = await Promise.map(this.args, async arg => {
        const filename = path.basename(arg)
        if (filename[0] === '@') {
          const filePath = path.join(this.cwd, arg)
          const content = await fs.readFile(filePath, 'utf8')
          return _.chain(content)
            .split('\n')
            .map(_.trim)
            .compact()
            .value()
        } else {
          return arg
        }
      })
      const featurePaths = _.flatten(nestedFeaturePaths)
      if (featurePaths.length > 0) {
        return featurePaths
      }
    }
    return ['features']
  }

  async expandSupportCodePaths(supportCodePaths) {
    const extensions = ['js']
    this.options.compiler.forEach(compiler => {
      const parts = compiler.split(':')
      extensions.push(parts[0])
      require(parts[1])
    })
    return await this.pathExpander.expandPathsWithExtensions(
      supportCodePaths,
      extensions
    )
  }
}
