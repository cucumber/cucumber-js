import Cli, { ICliRunResult } from './'
import VError from 'verror'

function exitWithError(error: Error): void {
  console.error(VError.fullStack(error)) // eslint-disable-line no-console
  process.exit(1)
}

function displayPublishAdvertismentBanner(): void {
  console.log(`┌──────────────────────────────────────────────────────────────────────────┐
│ Share your Cucumber Report with your team at https://reports.cucumber.io │
│                                                                          │
│ Command line option:    --publish                                        │
│ Environment variable:   CUCUMBER_PUBLISH_ENABLED=true                    │
│ cucumber.yml:           default: --publish                               │
│                                                                          │
│ More information at https://reports.cucumber.io/docs/cucumber-js         │
│                                                                          │
│ To disable this message, specify CUCUMBER_PUBLISH_QUIET=true or use the  │
│ --publish-quiet option. You can also add this to your cucumber.yml:      │
│ default: --publish-quiet                                                 │
└──────────────────────────────────────────────────────────────────────────┘
`)
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
  if (!config.isPublishing) {
    displayPublishAdvertismentBanner()
  }

  const exitCode = result.success ? 0 : 1
  if (result.shouldExitImmediately) {
    process.exit(exitCode)
  } else {
    process.exitCode = exitCode
  }
}
