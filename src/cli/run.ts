import Cli, { ICliRunResult } from './'
import VError from 'verror'
import publishBanner from './publish_banner'
import { validateNodeEngineVersion } from './validate_node_engine_version'
import { supportsColor } from 'supports-color'
import stripAnsiStream from 'strip-ansi-stream'
import { Console } from 'console'

function logErrorMessageAndExit(logger: Console, message: string): void {
  logger.error(message)
  process.exit(1)
}

function displayPublishAdvertisementBanner(logger: Console): void {
  logger.error(publishBanner)
}

/*
If process.stderr doesn't support ANSI characters, pipe it through a stream that
strips them out. This is because some output we send to stderr uses ANSI
without checking for support, and we can't control it (for now).
 */
function sanitiseStdErr() {
  if (supportsColor(process.stderr)) {
    return process.stderr
  }
  const sanitised = stripAnsiStream()
  sanitised.pipe(process.stderr, { end: false })
  return sanitised
}

export default async function run(): Promise<void> {
  const stderr = sanitiseStdErr()
  const logger = new Console(stderr)

  validateNodeEngineVersion(
    process.version,
    (error) => {
      logger.error(error)
      process.exit(1)
    },
    logger.warn
  )

  const cli = new Cli({
    argv: process.argv,
    cwd: process.cwd(),
    stdout: process.stdout,
    stderr,
    env: process.env,
  })

  let result: ICliRunResult
  try {
    result = await cli.run()
  } catch (error) {
    logErrorMessageAndExit(logger, VError.fullStack(error))
  }

  if (result.shouldAdvertisePublish) {
    displayPublishAdvertisementBanner(logger)
  }

  const exitCode = result.success ? 0 : 1
  if (result.shouldExitImmediately) {
    process.exit(exitCode)
  } else {
    process.exitCode = exitCode
  }
}
