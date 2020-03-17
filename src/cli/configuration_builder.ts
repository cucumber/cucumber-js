import _ from 'lodash'
import ArgvParser, {
  IParsedArgvOptions,
  IParsedArgvFormatOptions,
} from './argv_parser'
import fs from 'mz/fs'
import path from 'path'
import OptionSplitter from './option_splitter'
import bluebird from 'bluebird'
import glob from 'glob'
import { promisify } from 'util'
import { IPickleFilterOptions } from '../pickle_filter'
import { IRuntimeOptions } from '../runtime'

export interface IConfigurationFormat {
  outputTo: string
  type: string
}

export interface IConfiguration {
  featureDefaultLanguage: string
  featurePaths: string[]
  formats: IConfigurationFormat[]
  formatOptions: IParsedArgvFormatOptions
  listI18nKeywordsFor: string
  listI18nLanguages: boolean
  order: string
  parallel: number
  pickleFilterOptions: IPickleFilterOptions
  predictableIds: boolean
  profiles: string[]
  runtimeOptions: IRuntimeOptions
  shouldExitImmediately: boolean
  supportCodePaths: string[]
  supportCodeRequiredModules: string[]
}

export interface INewConfigurationBuilderOptions {
  argv: string[]
  cwd: string
}

export default class ConfigurationBuilder {
  static async build(
    options: INewConfigurationBuilderOptions
  ): Promise<IConfiguration> {
    const builder = new ConfigurationBuilder(options)
    return builder.build()
  }

  private readonly cwd: string
  private readonly args: string[]
  private readonly options: IParsedArgvOptions

  constructor({ argv, cwd }: INewConfigurationBuilderOptions) {
    this.cwd = cwd

    ArgvParser.lint(argv)
    const parsedArgv = ArgvParser.parse(argv)
    this.args = parsedArgv.args
    this.options = parsedArgv.options
  }

  async build(): Promise<IConfiguration> {
    const listI18nKeywordsFor = this.options.i18nKeywords
    const listI18nLanguages = this.options.i18nLanguages
    const unexpandedFeaturePaths = await this.getUnexpandedFeaturePaths()
    let featurePaths: string[] = []
    let supportCodePaths: string[] = []
    if (listI18nKeywordsFor === '' && !listI18nLanguages) {
      featurePaths = await this.expandFeaturePaths(unexpandedFeaturePaths)
      let unexpandedSupportCodePaths = this.options.require
      if (unexpandedSupportCodePaths.length === 0) {
        unexpandedSupportCodePaths = this.getFeatureDirectoryPaths(featurePaths)
      }
      supportCodePaths = await this.expandPaths(
        unexpandedSupportCodePaths,
        '.js'
      )
    }
    return {
      featureDefaultLanguage: this.options.language,
      featurePaths,
      formats: this.getFormats(),
      formatOptions: this.options.formatOptions,
      listI18nKeywordsFor,
      listI18nLanguages,
      order: this.options.order,
      parallel: this.options.parallel,
      pickleFilterOptions: {
        cwd: this.cwd,
        featurePaths: unexpandedFeaturePaths,
        names: this.options.name,
        tagExpression: this.options.tags,
      },
      predictableIds: this.options.predictableIds,
      profiles: this.options.profile,
      runtimeOptions: {
        dryRun: this.options.dryRun,
        failFast: this.options.failFast,
        filterStacktraces: !this.options.backtrace,
        retry: this.options.retry,
        retryTagFilter: this.options.retryTagFilter,
        strict: this.options.strict,
        worldParameters: this.options.worldParameters,
      },
      shouldExitImmediately: this.options.exit,
      supportCodePaths,
      supportCodeRequiredModules: this.options.requireModule,
    }
  }

  async expandPaths(
    unexpandedPaths: string[],
    defaultExtension: string
  ): Promise<string[]> {
    const expandedPaths = await bluebird.map(
      unexpandedPaths,
      async unexpandedPath => {
        const matches = await promisify(glob)(unexpandedPath, {
          absolute: true,
          cwd: this.cwd,
        })
        const expanded = await bluebird.map(matches, async match => {
          if (path.extname(match) === '') {
            return promisify(glob)(`${match}/**/*${defaultExtension}`)
          }
          return [match]
        })
        return _.flatten(expanded)
      }
    )
    return _.flatten(expandedPaths).map(x => path.normalize(x))
  }

  async expandFeaturePaths(featurePaths: string[]): Promise<string[]> {
    featurePaths = featurePaths.map(p => p.replace(/(:\d+)*$/g, '')) // Strip line numbers
    return this.expandPaths(featurePaths, '.feature')
  }

  getFeatureDirectoryPaths(featurePaths: string[]): string[] {
    const featureDirs = featurePaths.map(featurePath => {
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
      return path.relative(this.cwd, featureDir)
    })
    return _.uniq(featureDirs)
  }

  getFormats(): IConfigurationFormat[] {
    const mapping: { [key: string]: string } = { '': 'progress' }
    this.options.format.forEach(format => {
      const [type, outputTo] = OptionSplitter.split(format)
      mapping[outputTo] = type
    })
    return _.map(mapping, (type, outputTo) => ({ outputTo, type }))
  }

  async getUnexpandedFeaturePaths(): Promise<string[]> {
    if (this.args.length > 0) {
      const nestedFeaturePaths = await bluebird.map(this.args, async arg => {
        const filename = path.basename(arg)
        if (filename[0] === '@') {
          const filePath = path.join(this.cwd, arg)
          const content = await fs.readFile(filePath, 'utf8')
          return _.chain(content)
            .split('\n')
            .map(_.trim)
            .compact()
            .value()
        }
        return [arg]
      })
      const featurePaths = _.flatten(nestedFeaturePaths)
      if (featurePaths.length > 0) {
        return featurePaths
      }
    }
    return ['features/**/*.feature']
  }
}
