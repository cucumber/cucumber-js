import { When, Then } from '../../'
import { expect } from 'chai'
import { normalizeText } from '../support/helpers'
import stringArgv from 'string-argv'
import Mustache from 'mustache'
import {
  valueOrDefault,
  doesNotHaveValue,
  doesHaveValue,
} from '../../src/value_checker'
import { World } from '../support/world'

When(
  /^I run cucumber-js(?: with `(|.+)`)?$/,
  { timeout: 10000 },
  async function(this: World, args: string) {
    const renderedArgs = Mustache.render(valueOrDefault(args, ''), this)
    const stringArgs = stringArgv(renderedArgs)
    return this.run(this.localExecutablePath, stringArgs)
  }
)

When(
  /^I run cucumber-js with all formatters(?: and `(|.+)`)?$/,
  { timeout: 10000 },
  async function(this: World, args: string) {
    if (doesNotHaveValue(args)) {
      args = ''
    }
    // message is always outputted as part of run
    const formats = ['json:json.out']
    args += ' ' + formats.map(f => `--format ${f}`).join(' ')
    const renderedArgs = Mustache.render(args, this)
    const stringArgs = stringArgv(renderedArgs)
    return this.run(this.localExecutablePath, stringArgs)
  }
)

When(
  /^I run cucumber-js \(installed (locally|globally)\)$/,
  { timeout: 10000 },
  async function(this: World, location) {
    if (location === 'locally') {
      return this.run(this.localExecutablePath, [])
    }
    return this.run(this.globalExecutablePath, [])
  }
)

Then(/^it passes$/, () => {}) // eslint-disable-line @typescript-eslint/no-empty-function

Then(/^it fails$/, function(this: World) {
  const actualCode = doesHaveValue(this.lastRun.error)
    ? this.lastRun.error.code
    : 0
  expect(actualCode).not.to.eql(0)
  this.verifiedLastRunError = true
})

Then(/^it outputs the text:$/, function(this: World, text) {
  const actualOutput = normalizeText(this.lastRun.output)
  const expectedOutput = normalizeText(text)
  expect(actualOutput).to.eql(expectedOutput)
})

Then(/^the output contains the text:$/, function(this: World, text) {
  const actualOutput = normalizeText(this.lastRun.output)
  const expectedOutput = normalizeText(text)
  expect(actualOutput).to.include(expectedOutput)
})

Then('the output does not contain the text:', function(this: World, text) {
  const actualOutput = normalizeText(this.lastRun.output)
  const expectedOutput = normalizeText(text)
  expect(actualOutput).not.to.include(expectedOutput)
})

Then(/^the error output contains the text snippets:$/, function(
  this: World,
  table
) {
  const actualOutput = normalizeText(this.lastRun.errorOutput)
  table.rows().forEach(row => {
    const expectedOutput = normalizeText(row[0])
    expect(actualOutput).to.include(expectedOutput)
  })
})

Then(/^the error output contains the text:$/, function(this: World, text) {
  const actualOutput = normalizeText(this.lastRun.errorOutput)
  const expectedOutput = normalizeText(text)
  expect(actualOutput).to.include(expectedOutput)
})

Then(/^I see the version of Cucumber$/, function(this: World) {
  const version = require('../../package.json').version
  const actualOutput = this.lastRun.output
  const expectedOutput = `${version}\n`
  expect(actualOutput).to.eql(expectedOutput)
})

Then(/^I see the help text for Cucumber$/, function(this: World) {
  const actualOutput = this.lastRun.output
  const expectedOutput = 'Usage: cucumber-js'
  expect(actualOutput).to.include(expectedOutput)
})
