import { getExpandedArgv } from './helpers'
import { validateInstall } from './install_validator'
import { buildConfiguration, isTruthyString } from './configuration_builder'
import { IFormatterStream } from '../formatter'
import { runCucumber } from '../run'
import ArgvParser from './argv_parser'

export interface ICliRunResult {
  shouldAdvertisePublish: boolean
  shouldExitImmediately: boolean
  success: boolean
}

export default class Cli {
  private readonly argv: string[]
  private readonly cwd: string
  private readonly stdout: IFormatterStream
  private readonly env: NodeJS.ProcessEnv

  constructor({
    argv,
    cwd,
    stdout,
    env,
  }: {
    argv: string[]
    cwd: string
    stdout: IFormatterStream
    env: NodeJS.ProcessEnv
  }) {
    this.argv = argv
    this.cwd = cwd
    this.stdout = stdout
    this.env = env
  }

  async run(): Promise<ICliRunResult> {
    await validateInstall(this.cwd)
    const fromArgv = ArgvParser.parse(
      await getExpandedArgv({
        argv: this.argv,
        cwd: this.cwd,
      })
    )
    const configuration = await buildConfiguration(fromArgv, this.env)
    const { success } = await runCucumber(configuration, {
      cwd: this.cwd,
      stdout: this.stdout,
      env: this.env,
    })
    return {
      shouldAdvertisePublish:
        !configuration.formats.publish &&
        !fromArgv.options.publishQuiet &&
        !isTruthyString(this.env.CUCUMBER_PUBLISH_QUIET),
      shouldExitImmediately: fromArgv.options.exit,
      success,
    }
  }
}
