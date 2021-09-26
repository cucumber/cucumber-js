import { getExpandedArgv } from './helpers'
import { validateInstall } from './install_validator'
import ConfigurationBuilder, {
  buildConfiguration,
  IConfiguration,
} from './configuration_builder'
import { IFormatterStream } from '../formatter'
import { runCucumber } from '../api'
import ArgvParser from './argv_parser'

export interface ICliRunResult {
  shouldExitImmediately: boolean
  success: boolean
}
export default class Cli {
  private readonly argv: string[]
  private readonly cwd: string
  private readonly stdout: IFormatterStream

  constructor({
    argv,
    cwd,
    stdout,
  }: {
    argv: string[]
    cwd: string
    stdout: IFormatterStream
  }) {
    this.argv = argv
    this.cwd = cwd
    this.stdout = stdout
  }

  async getConfiguration(): Promise<IConfiguration> {
    const fullArgv = await getExpandedArgv({
      argv: this.argv,
      cwd: this.cwd,
    })
    return await ConfigurationBuilder.build({
      argv: fullArgv,
      cwd: this.cwd,
    })
  }

  async run(): Promise<ICliRunResult> {
    await validateInstall(this.cwd)
    const fromArgv = ArgvParser.parse(
      await getExpandedArgv({
        argv: this.argv,
        cwd: this.cwd,
      })
    )
    const configuration = await buildConfiguration(fromArgv)
    const { success } = await runCucumber(configuration, {
      cwd: this.cwd,
      stdout: this.stdout,
    })
    return {
      shouldExitImmediately: fromArgv.options.exit,
      success,
    }
  }
}
