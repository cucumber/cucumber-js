import Cli, { type ICliRunResult } from './'
import { validateNodeEngineVersion } from './validate_node_engine_version'

function logErrorMessageAndExit(message: string): void {
  // biome-ignore lint/suspicious/noConsole: cli entrypoint, other code abstracts console for testability
  console.error(message)
  process.exit(1)
}

export default async function run(): Promise<void> {
  validateNodeEngineVersion(
    process.version,
    (error) => {
      // biome-ignore lint/suspicious/noConsole: cli entrypoint, other code abstracts console for testability
      console.error(error)
      process.exit(1)
    },
    // biome-ignore lint/suspicious/noConsole: cli entrypoint, other code abstracts console for testability
    console.warn
  )

  const cli = new Cli({
    argv: process.argv,
    cwd: process.cwd(),
    stdout: process.stdout,
    stderr: process.stderr,
    env: process.env,
  })

  let result: ICliRunResult
  try {
    result = await cli.run()
  } catch (error) {
    logErrorMessageAndExit(error)
  }

  const exitCode = result.success ? 0 : 1
  if (result.shouldExitImmediately) {
    process.exit(exitCode)
  } else {
    process.exitCode = exitCode
  }
}
