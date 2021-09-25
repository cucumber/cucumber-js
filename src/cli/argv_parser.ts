import { Command } from 'commander'
import path from 'path'
import { dialects } from '@cucumber/gherkin'
import { SnippetInterface } from '../formatter/step_definition_snippet_builder/snippet_syntax'
import { getKeywords, getLanguages } from './i18n'

// Using require instead of import so compiled typescript will have the desired folder structure
const { version } = require('../../package.json') // eslint-disable-line @typescript-eslint/no-var-requires

export interface IParsedArgvFormatRerunOptions {
  separator?: string
}

export interface IParsedArgvFormatOptions {
  colorsEnabled?: boolean
  rerun?: IParsedArgvFormatRerunOptions
  snippetInterface?: SnippetInterface
  snippetSyntax?: string
  [customKey: string]: any
}

export interface IParsedArgvOptions {
  backtrace: boolean
  config: string
  dryRun: boolean
  exit: boolean
  failFast: boolean
  format: string[]
  formatOptions: IParsedArgvFormatOptions
  i18nKeywords: string
  i18nLanguages: boolean
  language: string
  name: string[]
  order: string
  parallel: number
  predictableIds: boolean
  profile: string[]
  publish: boolean
  publishQuiet: boolean
  require: string[]
  requireModule: string[]
  retry: number
  retryTagFilter: string
  strict: boolean
  tags: string
  worldParameters: object
}

export interface IParsedArgv {
  args: string[]
  options: IParsedArgvOptions
}

const ArgvParser = {
  collect<T>(val: T, memo: T[]): T[] {
    memo.push(val)
    return memo
  },

  mergeJson(option: string): (str: string, memo: object) => object {
    return function (str: string, memo: object) {
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
      return { ...memo, ...val }
    }
  },

  mergeTags(value: string, memo: string): string {
    return memo === '' ? `(${value})` : `${memo} and (${value})`
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

  validateRetryOptions(options: IParsedArgvOptions): void {
    if (options.retryTagFilter !== '' && options.retry === 0) {
      throw new Error(
        'a positive --retry count must be specified when setting --retry-tag-filter'
      )
    }
  },

  parse(argv: string[]): IParsedArgv {
    const program = new Command(path.basename(argv[1]))

    program
      .storeOptionsAsProperties(false)
      .usage('[options] [<GLOB|DIR|FILE[:LINE]>...]')
      .version(version, '-v, --version')
      .option('-b, --backtrace', 'show full backtrace for errors')
      .option('-c, --config <TYPE[:PATH]>', 'specify configuration file')
      .option(
        '-d, --dry-run',
        'invoke formatters without executing steps',
        false
      )
      .option(
        '--exit',
        'force shutdown of the event loop when the test run has finished: cucumber will call process.exit',
        false
      )
      .option('--fail-fast', 'abort the run on first failure', false)
      .option(
        '-f, --format <TYPE[:PATH]>',
        'specify the output format, optionally supply PATH to redirect formatter output (repeatable)',
        ArgvParser.collect,
        []
      )
      .option(
        '--format-options <JSON>',
        'provide options for formatters (repeatable)',
        ArgvParser.mergeJson('--format-options'),
        {}
      )
      .option(
        '--i18n-keywords <ISO 639-1>',
        'list language keywords',
        ArgvParser.validateLanguage,
        ''
      )
      .option('--i18n-languages', 'list languages', false)
      .option(
        '--language <ISO 639-1>',
        'provide the default language for feature files',
        'en'
      )
      .option(
        '--name <REGEXP>',
        'only execute the scenarios with name matching the expression (repeatable)',
        ArgvParser.collect,
        []
      )
      .option('--no-strict', 'succeed even if there are pending steps')
      .option(
        '--order <TYPE[:SEED]>',
        'run scenarios in the specified order. Type should be `defined` or `random`',
        'defined'
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
        (val) => ArgvParser.validateCountOption(val, '--parallel'),
        0
      )
      .option(
        '--predictable-ids',
        'Use predictable ids in messages (option ignored if using parallel)',
        false
      )
      .option(
        '--publish',
        'Publish a report to https://reports.cucumber.io',
        false
      )
      .option(
        '--publish-quiet',
        "Don't print information banner about publishing reports",
        false
      )
      .option(
        '-r, --require <GLOB|DIR|FILE>',
        'require files before executing features (repeatable)',
        ArgvParser.collect,
        []
      )
      .option(
        '--require-module <NODE_MODULE>',
        'require node modules before requiring files (repeatable)',
        ArgvParser.collect,
        []
      )
      .option(
        '--retry <NUMBER_OF_RETRIES>',
        'specify the number of times to retry failing test cases (default: 0)',
        (val) => ArgvParser.validateCountOption(val, '--retry'),
        0
      )
      .option(
        '--retry-tag-filter <EXPRESSION>',
        `only retries the features or scenarios with tags matching the expression (repeatable).
        This option requires '--retry' to be specified.`,
        ArgvParser.mergeTags,
        ''
      )
      .option(
        '-t, --tags <EXPRESSION>',
        'only execute the features or scenarios with tags matching the expression (repeatable)',
        ArgvParser.mergeTags,
        ''
      )
      .option(
        '--world-parameters <JSON>',
        'provide parameters that will be passed to the world constructor (repeatable)',
        ArgvParser.mergeJson('--world-parameters'),
        {}
      )

    program.on('option:i18n-languages', () => {
      console.log(getLanguages())
      process.exit()
    })

    program.on('option:i18n-keywords', function (isoCode: string) {
      console.log(getKeywords(isoCode))
      process.exit()
    })

    program.addHelpText(
      'afterAll',
      'For more details please visit https://github.com/cucumber/cucumber-js/blob/main/docs/cli.md'
    )

    program.parse(argv)
    const options: IParsedArgvOptions = program.opts()
    ArgvParser.validateRetryOptions(options)

    return {
      options,
      args: program.args,
    }
  },
}

export default ArgvParser
