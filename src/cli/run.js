import Cli from './'
import upgradeBanner from './upgrade_banner'
import VError from 'verror'

function exitWithError(error) {
  console.error(VError.fullStack(error)) // eslint-disable-line no-console
  process.exit(1)
}

export default async function run() {
  const cwd = process.cwd()
  const cli = new Cli({
    argv: process.argv,
    cwd,
    stdout: process.stdout,
  })

  let result
  try {
    result = await cli.run()
  } catch (error) {
    exitWithError(error)
  }

  if (result.success) {
    console.error(upgradeBanner)
  }

  const exitCode = result.success ? 0 : 1
  if (result.shouldExitImmediately) {
    process.exit(exitCode)
  } else {
    process.exitCode = exitCode
  }
}
