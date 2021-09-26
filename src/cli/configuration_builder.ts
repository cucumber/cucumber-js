import ArgvParser, {
  IParsedArgv,
  IParsedArgvFormatOptions,
  IParsedArgvOptions,
} from './argv_parser'
import fs from 'mz/fs'
import path from 'path'
import OptionSplitter from './option_splitter'
import glob from 'glob'
import { promisify } from 'util'
import { IPickleFilterOptions } from '../pickle_filter'
import { IRuntimeOptions } from '../runtime'
import { valueOrDefault } from '../value_checker'
import { IRunConfiguration } from '../configuration'

export interface IConfigurationFormat {
  outputTo: string
  type: string
}

export interface IConfiguration {
  featureDefaultLanguage: string
  featurePaths: string[]
  formats: IConfigurationFormat[]
  formatOptions: IParsedArgvFormatOptions
  publishing: boolean
  order: string
  parallel: number
  pickleFilterOptions: IPickleFilterOptions
  predictableIds: boolean
  profiles: string[]
  runtimeOptions: IRuntimeOptions
  shouldExitImmediately: boolean
  supportCodePaths: string[]
  supportCodeRequiredModules: string[]
  suppressPublishAdvertisement: boolean
}

export interface INewConfigurationBuilderOptions {
  argv: string[]
  cwd: string
}

const DEFAULT_CUCUMBER_PUBLISH_URL = 'https://messages.cucumber.io/api/reports'

export default class ConfigurationBuilder {
  static async build(
    options: INewConfigurationBuilderOptions
  ): Promise<IConfiguration> {
    const builder = new ConfigurationBuilder(options)
    return await builder.build()
  }

  private readonly cwd: string
  private readonly args: string[]
  private readonly options: IParsedArgvOptions

  constructor({ argv, cwd }: INewConfigurationBuilderOptions) {
    this.cwd = cwd
    const parsedArgv = ArgvParser.parse(argv)
    this.args = parsedArgv.args
    this.options = parsedArgv.options
  }

  async build(): Promise<IConfiguration> {
    const unexpandedFeaturePaths = await this.getUnexpandedFeaturePaths()
    const featurePaths: string[] = await this.expandFeaturePaths(
      unexpandedFeaturePaths
    )
    let unexpandedSupportCodePaths = this.options.require
    if (unexpandedSupportCodePaths.length === 0) {
      unexpandedSupportCodePaths = this.getFeatureDirectoryPaths(featurePaths)
    }
    const supportCodePaths = await this.expandPaths(
      unexpandedSupportCodePaths,
      '.@(js|mjs)'
    )
    return {
      featureDefaultLanguage: this.options.language,
      featurePaths,
      formats: this.getFormats(),
      formatOptions: this.options.formatOptions,
      publishing: this.isPublishing(),
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
        predictableIds: this.options.predictableIds,
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
      suppressPublishAdvertisement: this.isPublishAdvertisementSuppressed(),
    }
  }

  async expandPaths(
    unexpandedPaths: string[],
    defaultExtension: string
  ): Promise<string[]> {
    const expandedPaths = await Promise.all(
      unexpandedPaths.map(async (unexpandedPath) => {
        const matches = await promisify(glob)(unexpandedPath, {
          absolute: true,
          cwd: this.cwd,
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

  async expandFeaturePaths(featurePaths: string[]): Promise<string[]> {
    featurePaths = featurePaths.map((p) => p.replace(/(:\d+)*$/g, '')) // Strip line numbers
    featurePaths = [...new Set(featurePaths)] // Deduplicate the feature files
    return await this.expandPaths(featurePaths, '.feature')
  }

  getFeatureDirectoryPaths(featurePaths: string[]): string[] {
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
      return path.relative(this.cwd, featureDir)
    })
    return [...new Set(featureDirs)]
  }

  isPublishing(): boolean {
    return (
      this.options.publish ||
      this.isTruthyString(process.env.CUCUMBER_PUBLISH_ENABLED) ||
      process.env.CUCUMBER_PUBLISH_TOKEN !== undefined
    )
  }

  isPublishAdvertisementSuppressed(): boolean {
    return (
      this.options.publishQuiet ||
      this.isTruthyString(process.env.CUCUMBER_PUBLISH_QUIET)
    )
  }

  getFormats(): IConfigurationFormat[] {
    const mapping: { [key: string]: string } = { '': 'progress' }
    this.options.format.forEach((format) => {
      const [type, outputTo] = OptionSplitter.split(format)
      mapping[outputTo] = type
    })
    if (this.isPublishing()) {
      const publishUrl = valueOrDefault(
        process.env.CUCUMBER_PUBLISH_URL,
        DEFAULT_CUCUMBER_PUBLISH_URL
      )

      mapping[publishUrl] = 'message'
    }
    return Object.keys(mapping).map((outputTo) => ({
      outputTo,
      type: mapping[outputTo],
    }))
  }

  isTruthyString(s: string | undefined): boolean {
    if (s === undefined) {
      return false
    }
    return s.match(/^(false|no|0)$/i) === null
  }

  async getUnexpandedFeaturePaths(): Promise<string[]> {
    if (this.args.length > 0) {
      const nestedFeaturePaths = await Promise.all(
        this.args.map(async (arg) => {
          const filename = path.basename(arg)
          if (filename[0] === '@') {
            const filePath = path.join(this.cwd, arg)
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
}

export async function buildConfiguration(
  fromArgv: IParsedArgv
): Promise<IRunConfiguration> {
  const { args, options } = fromArgv
  return {
    sources: {
      paths: args,
      defaultDialect: options.language,
    },
    pickles: {
      order: options.order,
      names: options.name,
      tagExpression: options.tags,
    },
    support: {
      transpileWith: options.requireModule,
      paths: options.require,
    },
    runtime: {
      dryRun: options.dryRun,
      failFast: options.failFast,
      filterStacktraces: !options.backtrace,
      parallel: options.parallel > 0 ? { count: options.parallel } : null,
      retry:
        options.retry > 0
          ? {
              count: options.retry,
              tagExpression: options.retryTagFilter,
            }
          : null,
      strict: options.strict,
      worldParameters: options.worldParameters,
    },
    formats: {
      stdout: options.format.find((option) => !option.includes(':')),
      files: options.format
        .filter((option) => option.includes(':'))
        .reduce((prev, curr) => {
          const [type, target] = OptionSplitter.split(curr)
          return {
            ...prev,
            [target]: type,
          }
        }, {}),
      options: options.formatOptions,
    },
  }
}
