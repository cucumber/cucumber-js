import { setWorldConstructor, Cli } from '../../'
import { execFile } from 'child_process'
import { expect } from 'chai'
import toString from 'stream-to-string'
import { PassThrough } from 'stream'
import colors from 'colors/safe'
import fs from 'fs'
import path from 'path'
import VError from 'verror'
import _ from 'lodash'

class World {
  async run(executablePath, inputArgs) {
    const args = ['node', executablePath]
      .concat(inputArgs, ['--backtrace', '--format', 'json:out.json'])
      .map(arg => {
        if (_.includes(arg, '/')) {
          return path.normalize(arg)
        }
        return arg
      })
    const cwd = this.tmpDir

    let result

    if (this.spawn) {
      result = await new Promise(resolve => {
        execFile(args[0], args.slice(1), { cwd }, (error, stdout, stderr) => {
          resolve({ error, stdout, stderr })
        })
      })
    } else {
      const stdout = new PassThrough()
      const cli = new Cli({
        argv: args,
        cwd,
        stdout,
      })
      let error, stderr
      try {
        const { success } = await cli.run()
        if (!success) {
          error = new Error('CLI exited with non-zero')
          error.code = 42
        }
        stderr = ''
      } catch (err) {
        error = err
        stderr = VError.fullStack(error)
      }
      stdout.end()
      result = { error, stdout: await toString(stdout), stderr }
    }

    let jsonOutput = []
    const jsonOutputPath = path.join(cwd, 'out.json')
    if (fs.existsSync(jsonOutputPath)) {
      const fileContent = fs.readFileSync(jsonOutputPath, 'utf8')
      if (fileContent) {
        jsonOutput = JSON.parse(fileContent)
      }
    }
    if (this.debug) {
      console.log(result.stdout + result.stderr) // eslint-disable-line no-console
    }
    this.lastRun = {
      error: result.error,
      errorOutput: result.stderr,
      jsonOutput,
      output: colors.strip(result.stdout),
    }
    this.verifiedLastRunError = false
    expect(this.lastRun.output).to.not.include('Unhandled rejection')
  }
}

setWorldConstructor(World)
