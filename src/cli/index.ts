import { getExpandedArgv } from './helpers'
import { validateInstall } from './install_validator'
import { IFormatterStream } from '../formatter'
import { runCucumber } from '../api'
import { getKeywords, getLanguages } from './i18n'
import {
  ArgvParser,
  convertConfiguration,
  mergeConfigurations,
  isTruthyString,
  DEFAULT_CONFIGURATION,
} from '../configuration'

export interface ICliRunResult {
  shouldAdvertisePublish: boolean
  shouldExitImmediately: boolean
  success: boolean
}

export default class Cli {
  private readonly argv: string[]
  private readonly cwd: string
  private readonly stdout: IFormatterStream
  private readonly stderr: IFormatterStream
  private readonly env: NodeJS.ProcessEnv

  constructor({
    argv,
    cwd,
    stdout,
    stderr,
    env,
  }: {
    argv: string[]
    cwd: string
    stdout: IFormatterStream
    stderr: IFormatterStream
    env: NodeJS.ProcessEnv
  }) {
    this.argv = argv
    this.cwd = cwd
    this.stdout = stdout
    this.stderr = stderr
    this.env = env
  }

  async run(): Promise<ICliRunResult> {
    await validateInstall(this.cwd)
    // TODO do process.argv first, then load config file and merge that in, then merge defaults
    const { options, configuration: argvConfiguration } = ArgvParser.parse(
      await getExpandedArgv({
        argv: this.argv,
        cwd: this.cwd,
      })
    )
    const configuration = mergeConfigurations(
      DEFAULT_CONFIGURATION,
      argvConfiguration
    )
    if (options.i18nLanguages) {
      this.stdout.write(getLanguages())
      return {
        shouldAdvertisePublish: false,
        shouldExitImmediately: true,
        success: true,
      }
    }
    if (options.i18nKeywords) {
      this.stdout.write(getKeywords(options.i18nKeywords))
      return {
        shouldAdvertisePublish: false,
        shouldExitImmediately: true,
        success: true,
      }
    }
    const runConfiguration = await convertConfiguration(configuration, this.env)
    const { success } = await runCucumber(runConfiguration, {
      cwd: this.cwd,
      stdout: this.stdout,
      stderr: this.stderr,
      env: this.env,
    })
    return {
      shouldAdvertisePublish:
        !runConfiguration.formats.publish &&
        !configuration.publishQuiet &&
        !isTruthyString(this.env.CUCUMBER_PUBLISH_QUIET),
      shouldExitImmediately: configuration.exit,
      success,
    }
  }
}
