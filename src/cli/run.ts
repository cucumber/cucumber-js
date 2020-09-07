import Cli, { ICliRunResult } from './'
import VError from 'verror'

function exitWithError(error: Error): void {
  console.error(VError.fullStack(error)) // eslint-disable-line no-console
  process.exit(1)
}

const BANNER = `┌──────────────────────────────────────────────────────────────────────────┐
│ Share your Cucumber Report with your team at https://reports.cucumber.io │
│                                                                          │
│ Command line option:    --publish                                        │
│ Environment variable:   CUCUMBER_PUBLISH_ENABLED=true                    │
│                                                                          │
│ More information at https://reports.cucumber.io/docs/cucumber-js         │
│                                                                          │
│ To disable this message, add this to your ./cucumber.js:                 │
│ module.exports = { default: '--publish-quiet' }                          │
└──────────────────────────────────────────────────────────────────────────┘
`

function displayPublishAdvertisementBanner(): void {
  console.error(BANNER)
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
