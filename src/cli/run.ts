import Cli, { ICliRunResult } from './'
import VError from 'verror'
import publishBanner from './publish_banner'
import { assertNodeEngineVersion } from './assert_node_engine_version'

function logErrorMessageAndExit(message: string): void {
  console.error(message) // eslint-disable-line no-console
  process.exit(1)
}

function displayPublishAdvertisementBanner(): void {
  console.error(publishBanner) // eslint-disable-line no-console
}

export default async function run(): Promise<void> {
  try {
    assertNodeEngineVersion(process.version)
  } catch (error) {
    logErrorMessageAndExit(error.message)
  }

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
    logErrorMessageAndExit(VError.fullStack(error))
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
