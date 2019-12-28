import _ from 'lodash'
import { Command } from 'commander'
import path from 'path'
import Gherkin from 'gherkin'
import { SnippetInterface } from '../formatter/step_definition_snippet_builder/snippet_syntax'

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
    return function(str: string, memo: object) {
      let val: object
      try {
        val = JSON.parse(str)
      } catch (error) {
        throw new Error(
          `${option} passed invalid JSON: ${error.message}: ${str}`
        )
      }
      if (!_.isPlainObject(val)) {
        throw new Error(`${option} must be passed JSON of an object: ${str}`)
      }
      return _.merge(memo, val)
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
    if (!_.includes(_.keys(Gherkin.dialects()), value)) {
      throw new Error(`Unsupported ISO 639-1: ${value}`)
    }
    return value
  },

  validateRetryOptions(options: IParsedArgvOptions): void {
    if (options.retryTagFilter !== '' && options.retry === 0) {
      throw new Error(
        'a positive --retry count must be specified when setting --retryTagFilter'
      )
    }
  },

  parse(argv: string[]): IParsedArgv {
    const program = new Command(path.basename(argv[1]))

    program
      .usage('[options] [<GLOB|DIR|FILE[:LINE]>...]')
      .version(version, '-v, --version')
      .option('-b, --backtrace', 'show full backtrace for errors')
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
        '--parallel <NUMBER_OF_SLAVES>',
        'run in parallel with the given number of slaves',
        val => ArgvParser.validateCountOption(val, '--parallel'),
        0
      )
      .option(
        '--predictable-ids',
        'Use predictable ids in messages (option ignored if using parallel)',
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
        val => ArgvParser.validateCountOption(val, '--retry'),
        0
      )
      .option(
        '--retryTagFilter <EXPRESSION>',
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

    program.on('--help', () => {
      /* eslint-disable no-console */
      console.log(
        '  For more details please visit https://github.com/cucumber/cucumber-js/blob/master/docs/cli.md\n'
      )
      /* eslint-enable no-console */
    })

    program.parse(argv)
    const options = program.opts() as IParsedArgvOptions
    ArgvParser.validateRetryOptions(options)

    return {
      options,
      args: program.args,
    }
  },
}

export default ArgvParser
