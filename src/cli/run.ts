import Cli, { ICliRunResult, ISupportCodeImporter } from './'
import VError from 'verror'
import publishBanner from './publish_banner'

function exitWithError(error: Error): void {
  console.error(VError.fullStack(error)) // eslint-disable-line no-console
  process.exit(1)
}

function displayPublishAdvertisementBanner(): void {
  console.error(publishBanner)
}

export default async function run(
  importer?: ISupportCodeImporter
): Promise<void> {
  const cwd = process.cwd()
  const cli = new Cli({
    argv: process.argv,
    cwd,
    importer,
    stdout: process.stdout,
  })

  let result: ICliRunResult
  try {
    result = await cli.run()
  } catch (error) {
    exitWithError(error)
  }

  const config = await cli.getConfiguration()
  if (!config.publishing && !config.suppressPublishAdvertisement) {
    displayPublishAdvertisementBanner()
  }

  const exitCode = result.success ? 0 : 1
  if (result.shouldExitImmediately) {
    process.exit(exitCode)
  } else {
    process.exitCode = exitCode
  }
}
