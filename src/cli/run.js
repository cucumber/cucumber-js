import Cli from './'
import VError from 'verror'

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
    console.error(VError.fullStack(error)) // eslint-disable-line no-console
  }

  process.exitCode = success ? 0 : 1
  function exit() {
    setTimeout(process.exit, 5000).unref()
  }

  // If stdout.write() returned false, kernel buffer is not empty yet
  if (process.stdout.write('')) {
    exit()
  } else {
    process.stdout.on('drain', exit)
  }
}
