import _ from 'lodash'
import { Command } from 'commander'
import { version } from '../../package.json'
import path from 'path'
import Gherkin from 'gherkin'

export default class ArgvParser {
  static collect(val, memo) {
    memo.push(val)
    return memo
  }

  static mergeJson(option) {
    return function(str, memo) {
      let val
      try {
        val = JSON.parse(str)
      } catch (error) {
        throw new Error(
          option + ' passed invalid JSON: ' + error.message + ': ' + str
        )
      }
      if (!_.isPlainObject(val)) {
        throw new Error(option + ' must be passed JSON of an object: ' + str)
      }
      return _.merge(memo, val)
    }
  }

  static mergeTags(val, memo) {
    return memo === '' ? `(${val})` : `${memo} and (${val})`
  }

  static validateLanguage(val) {
    if (!_.includes(_.keys(Gherkin.DIALECTS), val)) {
      throw new Error('Unsupported ISO 639-1: ' + val)
    }
    return val
  }

  static parse(argv) {
    const program = new Command(path.basename(argv[1]))

    program
      .usage('[options] [<DIR|FILE[:LINE]>...]')
      .version(version, '-v, --version')
      .option('-b, --backtrace', 'show full backtrace for errors')
      .option(
        '--compiler <EXTENSION:MODULE>',
        'require files with the given EXTENSION after requiring MODULE (repeatable)',
        ArgvParser.collect,
        []
      )
      .option('-d, --dry-run', 'invoke formatters without executing steps')
      .option('--fail-fast', 'abort the run on first failure')
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
      .option('--i18n-languages', 'list languages')
      .option(
        '--language <ISO 639-1>',
        'provide the default language for feature files',
        ''
      )
      .option(
        '--name <REGEXP>',
        'only execute the scenarios with name matching the expression (repeatable)',
        ArgvParser.collect,
        []
      )
      .option('--no-strict', 'succeed even if there are pending steps')
      .option(
        '-p, --profile <NAME>',
        'specify the profile to use (repeatable)',
        ArgvParser.collect,
        []
      )
      .option(
        '-r, --require <FILE|DIR>',
        'require files before executing features (repeatable)',
        ArgvParser.collect,
        []
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
        '  For more details please visit https://github.com/cucumber/cucumber-js#cli\n'
      )
      /* eslint-enable no-console */
    })

    program.parse(argv)

    return {
      options: program.opts(),
      args: program.args
    }
  }
}
