import {defineSupportCode} from '../../'
import {execFile} from 'child_process'
import {expect} from 'chai'
import colors from 'colors/safe'
import fs from 'fs'
import path from 'path'

class World {
  async run(executablePath, inputArgs) {
    const args = [executablePath].concat(inputArgs, ['--backtrace', '--format', 'json:out.json'])
    const cwd = this.tmpDir
    const result = await new Promise((resolve) => {
      execFile('node', args, {cwd}, (error, stdout, stderr) => {
        resolve({error, stdout, stderr})
      })
    })
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
