/* eslint-disable babel/new-cap */

import {defineSupportCode} from '../../'
import {execFile} from 'child_process'
import {expect} from 'chai'
import {normalizeText} from '../support/helpers'
import colors from 'colors/safe'
import fs from 'fs'
import path from 'path'
import stringArgv from 'string-argv'

const executablePath = path.join(__dirname, '..', '..', 'bin', 'cucumber.js')

defineSupportCode(function({When, Then}) {
  When(/^I run cucumber.js(?: with `(|.+)`)?$/, {timeout: 10000}, function(args, callback) {
    args = stringArgv(args || '')
    args.unshift(executablePath)
    args.push('--backtrace', '--format', 'json:out.json')
    const cwd = this.tmpDir
    execFile('node', args, {cwd}, (error, stdout, stderr) => {
      let jsonOutput = []
      const jsonOutputPath = path.join(cwd, 'out.json')
      if (fs.existsSync(jsonOutputPath)) {
        const fileContent = fs.readFileSync(jsonOutputPath, 'utf8')
        if (fileContent) {
          jsonOutput = JSON.parse(fileContent)
        }
      }
      if (this.debug) {
        console.log(stdout + stderr) // eslint-disable-line no-console
      }
      this.lastRun = {
        error,
        jsonOutput,
        output: colors.strip(stdout) + stderr
      }
      this.verifiedLastRunError = false
      expect(this.lastRun.output).to.not.include('Unhandled rejection')
      callback()
    })
  })

  Then(/^it passes$/, function() {})

  Then(/^it fails$/, function() {
    const actualCode = this.lastRun.error ? this.lastRun.error.code : 0
    expect(actualCode).not.to.eql(0)
    this.verifiedLastRunError = true
  })

  Then(/^it outputs the text:$/, function(text) {
    const actualOutput = normalizeText(this.lastRun.output)
    const expectedOutput = normalizeText(text)
    expect(actualOutput).to.eql(expectedOutput)
  })

  Then(/^the output contains the text:$/, function(text) {
    const actualOutput = normalizeText(this.lastRun.output)
    const expectedOutput = normalizeText(text)
    expect(actualOutput).to.include(expectedOutput)
  })

  Then(/^the output contains the text snippets:$/, function(table) {
    const actualOutput = normalizeText(this.lastRun.output)
    table.rows().forEach((row) => {
      const expectedOutput = normalizeText(row[0])
      expect(actualOutput).to.include(expectedOutput)
    })
  })

  Then(/^I see the version of Cucumber$/, function() {
    const version = require('../../package.json').version
    const actualOutput = this.lastRun.output
    const expectedOutput = version + '\n'
    expect(actualOutput).to.eql(expectedOutput)
  })

  Then(/^I see the help text for Cucumber$/, function() {
    const actualOutput = this.lastRun.output
    const expectedOutput = 'Usage: cucumber.js'
    expect(actualOutput).to.include(expectedOutput)
  })
})
