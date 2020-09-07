import Cli, { ICliRunResult } from './'
import VError from 'verror'

function exitWithError(error: Error): void {
  console.error(VError.fullStack(error)) // eslint-disable-line no-console
  process.exit(1)
}

const bold = '\u001b[1m'
const green = '\u001b[32m'
const cyan = '\u001b[36m'
const underline = '\u001b[4m'
const reset = '\u001b[0m'

const BANNER = `${bold}${green}┌──────────────────────────────────────────────────────────────────────────┐${reset}
${bold}${green}│${reset}${reset} Share your Cucumber Report with your team at ${underline}${bold}${cyan}https://reports.cucumber.io${reset} ${bold}${green}│${reset}
${bold}${green}│${reset}                                                                          ${bold}${green}│${reset}
${bold}${green}│${reset} Command line option:    ${cyan}--publish${reset}                                        ${bold}${green}│${reset}
${bold}${green}│${reset} Environment variable:   ${cyan}CUCUMBER_PUBLISH_ENABLED${reset}=${cyan}true${reset}                    ${bold}${green}│${reset}
${bold}${green}│${reset}                                                                          ${bold}${green}│${reset}
${bold}${green}│${reset} More information at ${underline}${bold}${cyan}https://reports.cucumber.io/docs/cucumber-js${reset}         ${bold}${green}│${reset}
${bold}${green}│${reset}                                                                          ${bold}${green}│${reset}
${bold}${green}│${reset} To disable this message, add this to your ${bold}./cucumber.js${reset}:                 ${bold}${green}│${reset}
${bold}${green}│${reset} ${bold}module.exports = { default: '--publish-quiet' }${reset}                          ${bold}${green}│${reset}
${bold}${green}└──────────────────────────────────────────────────────────────────────────┘${reset}
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
