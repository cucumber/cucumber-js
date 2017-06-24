import Cli from './'
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
    stdout: process.stdout
  })

  let success
  try {
    success = await cli.run()
  } catch (error) {
    exitWithError(error)
  }

  const exitCode = success ? 0 : 1
  function exitNow() {
    process.exit(exitCode)
  }

  // If stdout.write() returned false, kernel buffer is not empty yet
  if (process.stdout.write('')) {
    exitNow()
  } else {
    process.stdout.on('drain', exitNow)
  }
}
