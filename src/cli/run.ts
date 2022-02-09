import Cli, { ICliRunResult } from './'
import VError from 'verror'
import publishBanner from './publish_banner'

function exitWithError(error: Error): void {
  console.error(VError.fullStack(error)) // eslint-disable-line no-console
  process.exit(1)
}

function displayPublishAdvertisementBanner(): void {
  console.error(publishBanner)
}

function assertNodeEngineVersion() {
  // None of this stuff will work on versions of Node older than v12
  const MIN_NODE_VERSION = 'v12'
  if (process.version < MIN_NODE_VERSION) {
    throw new Error(
      `Cucumber can only run on Node.js versions ${MIN_NODE_VERSION} and greater. This Node.js version is ${process.version}`
    )
  }
}

export default async function run(): Promise<void> {
  try {
    assertNodeEngineVersion()
  } catch (error) {
    console.error(error.message)
    process.exit(1)
  }

  const cli = new Cli({
    argv: process.argv,
    cwd: process.cwd(),
    stdout: process.stdout,
    env: process.env,
  })

  let result: ICliRunResult
  try {
    result = await cli.run()
  } catch (error) {
    exitWithError(error)
  }

  if (result.shouldAdvertisePublish) {
    displayPublishAdvertisementBanner()
  }

  const exitCode = result.success ? 0 : 1
  if (result.shouldExitImmediately) {
    process.exit(exitCode)
  } else {
    process.exitCode = exitCode
  }
}
