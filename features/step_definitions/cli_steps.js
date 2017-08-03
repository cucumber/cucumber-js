/* eslint-disable babel/new-cap */

import { defineSupportCode } from '../../'
import { expect } from 'chai'
import { normalizeText } from '../support/helpers'
import stringArgv from 'string-argv'

defineSupportCode(function({ When, Then }) {
  When(/^I run cucumber.js(?: with `(|.+)`)?$/, { timeout: 10000 }, function(
    args
  ) {
    args = stringArgv(args || '')
    return this.run(this.localExecutablePath, args)
  })

  When(
    /^I run cucumber.js \(installed (locally|globally)\)$/,
    { timeout: 10000 },
    function(location) {
      if (location === 'locally') {
        return this.run(this.localExecutablePath, [])
      } else {
        return this.run(this.globalExecutablePath, [])
      }
    }
  )

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

  Then(/^the error output contains the text snippets:$/, function(table) {
    const actualOutput = normalizeText(this.lastRun.errorOutput)
    table.rows().forEach(row => {
      const expectedOutput = normalizeText(row[0])
      expect(actualOutput).to.include(expectedOutput)
    })
  })

  Then(/^the error output contains the text:$/, function(text) {
    const actualOutput = normalizeText(this.lastRun.errorOutput)
    const expectedOutput = normalizeText(text)
    expect(actualOutput).to.include(expectedOutput)
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
