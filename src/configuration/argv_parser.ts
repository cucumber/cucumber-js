import { Command } from 'commander'
import merge from 'lodash.merge'
import { dialects } from '@cucumber/gherkin'
import { version } from '../version'
import builtin from '../formatter/builtin'
import { IConfiguration } from './types'

export interface IParsedArgvOptions {
  config?: string
  i18nKeywords?: string
  i18nLanguages?: boolean
  profile: string[]
}

export interface IParsedArgv {
  options: IParsedArgvOptions
  configuration: Partial<IConfiguration>
}

type IRawArgvOptions = Partial<Omit<IConfiguration, 'paths'>> &
  IParsedArgvOptions

const ArgvParser = {
  collect<T>(val: T, memo: T[] = []): T[] {
    if (val) {
      return [...memo, val]
    }
    return undefined
  },

  mergeJson(option: string): (str: string, memo?: object) => object {
    return function (str: string, memo: object = {}) {
      let val: object
      try {
        val = JSON.parse(str)
      } catch (error) {
        const e: Error = error
        throw new Error(`${option} passed invalid JSON: ${e.message}: ${str}`)
      }
      if (typeof val !== 'object' || Array.isArray(val)) {
        throw new Error(`${option} must be passed JSON of an object: ${str}`)
      }
      return merge(memo, val)
    }
  },

  mergeTags(value: string, memo?: string): string {
    return memo ? `${memo} and (${value})` : `(${value})`
  },

  validateCountOption(value: string, optionName: string): number {
    const numericValue = parseInt(value)
    if (isNaN(numericValue) || numericValue < 0) {
      throw new Error(`${optionName} must be a non negative integer`)
    }
    return numericValue
  },

  validateLanguage(value: string): string {
    if (!Object.keys(dialects).includes(value)) {
      throw new Error(`Unsupported ISO 639-1: ${value}`)
    }
    return value
  },

  parse(argv: string[]): IParsedArgv {
    const program = new Command('cucumber-js')

    program
      .storeOptionsAsProperties(false)
      .usage('[options] [<GLOB|DIR|FILE[:LINE]>...]')
      .version(version, '-v, --version')
      .option('-b, --backtrace', 'show full backtrace for errors')
      .option('-c, --config <PATH>', 'specify configuration file')
      .option('-d, --dry-run', 'invoke formatters without executing steps')
      .option(
        '--exit, --force-exit',
        'force shutdown of the event loop when the test run has finished: cucumber will call process.exit'
      )
      .option('--fail-fast', 'abort the run on first failure')
      .option(
        '-f, --format <TYPE[:PATH]>',
        'specify the output format, optionally supply PATH to redirect formatter output (repeatable).  Available formats:\n' +
          Object.entries(builtin).reduce(
            (previous, [key, formatter]) =>
              previous + `    ${key}: ${formatter.documentation}\n`,
            ''
          ),
        ArgvParser.collect
      )
      .option(
        '--format-options <JSON>',
        'provide options for formatters (repeatable)',
        ArgvParser.mergeJson('--format-options')
      )
      .option(
        '--i18n-keywords <ISO 639-1>',
        'list language keywords',
        ArgvParser.validateLanguage
      )
      .option('--i18n-languages', 'list languages')
      .option(
        '-i, --import <GLOB|DIR|FILE>',
        'import files before executing features (repeatable)',
        ArgvParser.collect
      )
      .option(
        '-l, --loader <NODE_MODULE>',
        'module specifier(s) for loaders to be registered ahead of loading support code',
        ArgvParser.collect
      )
      .option(
        '--language <ISO 639-1>',
        'provide the default language for feature files'
      )
      .option(
        '--name <REGEXP>',
        'only execute the scenarios with name matching the expression (repeatable)',
        ArgvParser.collect
      )

      .option(
        '--order <TYPE[:SEED]>',
        'run scenarios in the specified order. Type should be `defined` or `random`'
      )
      .option(
        '-p, --profile <NAME>',
        'specify the profile to use (repeatable)',
        ArgvParser.collect,
        []
      )
      .option(
        '--parallel <NUMBER_OF_WORKERS>',
        'run in parallel with the given number of workers',
        (val) => ArgvParser.validateCountOption(val, '--parallel')
      )
      .option('--publish', 'Publish a report to https://reports.cucumber.io')
      .option(
        '--publish-quiet',
        "Don't print information banner about publishing reports"
      )
      .option(
        '-r, --require <GLOB|DIR|FILE>',
        'require files before executing features (repeatable)',
        ArgvParser.collect
      )
      .option(
        '--require-module <NODE_MODULE>',
        'require node modules before requiring files (repeatable)',
        ArgvParser.collect
      )
      .option(
        '--retry <NUMBER_OF_RETRIES>',
        'specify the number of times to retry failing test cases (default: 0)',
        (val) => ArgvParser.validateCountOption(val, '--retry')
      )
      .option(
        '--retry-tag-filter <EXPRESSION>',
        `only retries the features or scenarios with tags matching the expression (repeatable).
        This option requires '--retry' to be specified.`,
        ArgvParser.mergeTags
      )
      .option('--strict', 'fail if there are pending steps')
      .option('--no-strict', 'succeed even if there are pending steps')
      .option(
        '-t, --tags <EXPRESSION>',
        'only execute the features or scenarios with tags matching the expression (repeatable)',
        ArgvParser.mergeTags
      )
      .option(
        '--world-parameters <JSON>',
        'provide parameters that will be passed to the world constructor (repeatable)',
        ArgvParser.mergeJson('--world-parameters')
      )

    program.addHelpText(
      'afterAll',
      'For more details please visit https://github.com/cucumber/cucumber-js/blob/main/docs/cli.md'
    )

    program.parse(argv)
    const {
      config,
      i18nKeywords,
      i18nLanguages,
      profile,
      ...regularStuff
    }: IRawArgvOptions = program.opts()
    const configuration: Partial<IConfiguration> = regularStuff
    if (program.args.length > 0) {
      configuration.paths = program.args
    }

    return {
      options: {
        config,
        i18nKeywords,
        i18nLanguages,
        profile,
      },
      configuration,
    }
  },
}

export default ArgvParser
