import Cli, { ICliRunResult } from './'
import VError from 'verror'

function exitWithError(error: Error): void {
  console.error(VError.fullStack(error)) // eslint-disable-line no-console
  process.exit(1)
}

export default async function run(): Promise<void> {
  const cwd = process.cwd()
  const cli = new Cli({
    argv: process.argv,
    cwd,
    stdout: process.stdout,
  })

  let result: ICliRunResult
  try {
    result = await cli.run()
  } catch (error) {
    exitWithError(error)
  }

  const exitCode = result.success ? 0 : 1
  if (result.shouldExitImmediately) {
    process.exit(exitCode)
  } else {
    process.exitCode = exitCode
  }
}
