/* eslint-disable babel/new-cap */

import colors from 'colors/safe'
import {execFile} from 'child_process'
import path from 'path'
import stringArgv from 'string-argv'
import {getAdditionalErrorText, normalizeText} from '../support/helpers'

const executablePath = path.join(__dirname, '..', '..', 'bin', 'cucumber.js')

export default function cliSteps() {
  this.When(/^I run cucumber.js(?: from the "([^"]*)" directory)?(?: with `(|.+)`)?$/, {timeout: 10000}, function(dir, args, callback) {
    args = stringArgv(args || '')
    args.unshift(executablePath)
    args.push('--backtrace')
    const cwd = dir ? path.join(this.tmpDir, dir) : this.tmpDir
    execFile('node', args, {cwd}, (error, stdout, stderr) => {
      this.lastRun = {
        error,
        stdout: colors.strip(stdout),
        stderr
      }
      callback()
    })
  })

  this.Then(/^it passes$/, function() {
    if (this.lastRun.error) {
      throw new Error('Expected last run to pass but it failed\n' +
                      'Output:\n' + normalizeText(this.lastRun.stdout)
                                  + normalizeText(this.lastRun.stderr))
    }
  })

  this.Then(/^the exit status should be ([0-9]+|non-zero)$/, function(code) {
    const actualCode = this.lastRun.error ? this.lastRun.error.code : 0
    const ok = (code === 'non-zero' && actualCode !== 0) || actualCode === parseInt(code)
    if (!ok) {
      throw new Error('Exit code expected: \'' + code + '\'\n' +
                      'Got: \'' + actualCode + '\'\n' +
                      'Output:\n' + normalizeText(this.lastRun.stdout) + '\n' +
                                    normalizeText(this.lastRun.stderr) + '\n')
    }
  })

  this.Then(/^it outputs this text:$/, function(expectedOutput) {
    const actualOutput = normalizeText(this.lastRun.stdout)
    expectedOutput = normalizeText(expectedOutput)
    if (actualOutput !== expectedOutput) {
      throw new Error('Expected output to match the following:\n' + expectedOutput + '\n' +
                      'Got:\n' + actualOutput + '\n' +
                      getAdditionalErrorText(this.lastRun))
    }
  })

  this.Then(/^the (error )?output contains the text:$/, function(error, expectedOutput) {
    const actualOutput = normalizeText(error ? this.lastRun.stderr : this.lastRun.stdout)
    expectedOutput = normalizeText(expectedOutput)
    if (actualOutput.indexOf(expectedOutput) === -1) {
      throw new Error('Expected output to contain the following:\n' + expectedOutput + '\n' +
                      'Got:\n' + actualOutput + '\n' +
                      getAdditionalErrorText(this.lastRun))
    }
  })

  this.Then(/^I see the version of Cucumber$/, function() {
    const version = require('../../package.json').version
    const actualOutput = this.lastRun.stdout
    const expectedOutput = version + '\n'
    if (actualOutput.indexOf(expectedOutput) === -1){
      throw new Error('Expected output to match the following:\n' + expectedOutput + '\n' +
                      'Got:\n' + actualOutput)
    }
  })

  this.Then(/^I see the help of Cucumber$/, function() {
    const actualOutput = this.lastRun.stdout
    const expectedOutput = 'Usage: cucumber.js '
    if (actualOutput.indexOf(expectedOutput) === -1) {
      throw new Error('Expected output to match the following:\n' + expectedOutput + '\n' +
                      'Got:\n' + actualOutput)
    }
  })

  this.Then(/^it suggests a "([^"]*)" step definition snippet(?: with (\d+) parameters?(?: named "([^"]*)")?)? for:$/, function (step, parameterCount, parameterName, regExp) {
    const parameters = []
    if (parameterName) {
      parameters.push(parameterName)
    }
    else if (parameterCount) {
      const count = parseInt(parameterCount)
      for (let i = 1; i <= count; i += 1) {
        parameters.push('arg' + i)
      }
    }
    parameters.push('callback')
    const expectedOutput = 'this.' + step + '(' + regExp + ', function (' + parameters.join(', ') + ') {\n'
    const actualOutput = normalizeText(this.lastRun.stdout)
    if (actualOutput.indexOf(expectedOutput) === -1) {
      throw new Error('Expected output to include the following:\n' + expectedOutput + '\n' +
                      'Got:\n' + actualOutput + '.\n' +
                      getAdditionalErrorText(this.lastRun))
    }
  })
}
