import {defineSupportCode, Cli} from '../../'
import {execFile} from 'child_process'
import {expect} from 'chai'
import toString from 'stream-to-string'
import {PassThrough} from 'stream'
import colors from 'colors/safe'
import mzFs from 'mz/fs'
import path from 'path'
import VError from 'verror'

class World {
  async run(executablePath, inputArgs) {
    const args = ['node', executablePath].concat(inputArgs, ['--backtrace', '--format', 'json:out.json'])
    const cwd = this.tmpDir

    let result

    if (this.spawn) {
      result = await new Promise((resolve) => {
        execFile(args[0], args.slice(1), {cwd}, (error, stdout, stderr) => {
          resolve({error, stdout, stderr})
        })
      })
    } else {
      const stdout = new PassThrough()
      const cli = new Cli({
        argv: args,
        cwd,
        stdout
      })
      let error, stderr
      try {
        if (!await cli.run()) {
          error = new Error('CLI exited with non-zero')
          error.code = 42
        }
        stderr = ''
      } catch (err) {
        error = err
        stderr = VError.fullStack(error)
      }
      stdout.end()
      result = {error, stdout: await toString(stdout), stderr}
    }

    let jsonOutput = []
    const jsonOutputPath = path.join(cwd, 'out.json')
    if (await mzFs.exists(jsonOutputPath)) {
      const fileContent = await mzFs.readFile(jsonOutputPath, 'utf8')
      if (fileContent) {
        jsonOutput = JSON.parse(fileContent)
      }
    }
    if (this.debug) {
      console.log(result.stdout + result.stderr) // eslint-disable-line no-console
    }
    this.lastRun = {
      error: result.error,
      jsonOutput,
      output: colors.strip(result.stdout) + result.stderr
    }
    this.verifiedLastRunError = false
    expect(this.lastRun.output).to.not.include('Unhandled rejection')
  }
}

defineSupportCode(({setWorldConstructor}) => {
  setWorldConstructor(World)
})
