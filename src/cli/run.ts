import Cli, { type ICliRunResult } from './'
import { validateNodeEngineVersion } from './validate_node_engine_version'

/**
 * Exit code used when test scenarios were run but at least one failed.
 */
const EXIT_CODE_TEST_FAILURES = 1

/**
 * Exit code used when Cucumber itself failed to run, e.g. an invalid
 * invocation, configuration or an unexpected error. This is distinct from
 * {@link EXIT_CODE_TEST_FAILURES} so that CI can tell genuine test failures
 * apart from a broken command.
 */
const EXIT_CODE_CUCUMBER_ERROR = 2

function logErrorMessageAndExit(message: unknown): void {
  // biome-ignore lint/suspicious/noConsole: cli entrypoint, other code abstracts console for testability
  console.error(message)
  process.exit(EXIT_CODE_CUCUMBER_ERROR)
}

export default async function run(): Promise<void> {
  validateNodeEngineVersion(
    process.version,
    (error) => {
      // biome-ignore lint/suspicious/noConsole: cli entrypoint, other code abstracts console for testability
      console.error(error)
      process.exit(EXIT_CODE_CUCUMBER_ERROR)
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

  const exitCode = result.success ? 0 : EXIT_CODE_TEST_FAILURES
  if (result.shouldExitImmediately) {
    process.exit(exitCode)
  } else {
    process.exitCode = exitCode
  }
}
