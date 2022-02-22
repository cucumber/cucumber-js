import Cli, { ICliRunResult } from './'
import VError from 'verror'
import publishBanner from './publish_banner'
import { validateNodeEngineVersion } from './validate_node_engine_version'

function exitWithError(error: Error): void {
  console.error(VError.fullStack(error)) // eslint-disable-line no-console
  process.exit(1)
}

function displayPublishAdvertisementBanner(): void {
  console.error(publishBanner)
}

export default async function run(): Promise<void> {
  validateNodeEngineVersion(process.version, (error) => {
    console.error(error) // eslint-disable-line no-console
    process.exit(1)
  })

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
