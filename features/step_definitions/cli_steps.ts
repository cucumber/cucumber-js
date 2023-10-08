import { expect } from 'chai'
import stringArgv from 'string-argv'
import Mustache from 'mustache'
import { normalizeText } from '../support/helpers'
import { DataTable, Then, When } from '../../'
import {
  doesHaveValue,
  doesNotHaveValue,
  valueOrDefault,
} from '../../src/value_checker'
import { World } from '../support/world'
import { version } from '../../src/version'

When('my env includes {string}', function (this: World, envString: string) {
  this.sharedEnv = this.parseEnvString(envString)
})

When('I run cucumber-js', { timeout: 10000 }, async function (this: World) {
  return await this.run(this.localExecutablePath, [])
})

When(
  'I run cucumber-js with `{}`',
  { timeout: 10000 },
  async function (this: World, args: string) {
    const renderedArgs = Mustache.render(valueOrDefault(args, ''), this)
    const stringArgs = stringArgv(renderedArgs)
    return await this.run(this.localExecutablePath, stringArgs)
  }
)

When(
  'I run cucumber-js with arguments `{}` and env `{}`',
  { timeout: 10000 },
  async function (this: World, args: string, envString: string) {
    const renderedArgs = Mustache.render(valueOrDefault(args, ''), this)
    const stringArgs = stringArgv(renderedArgs)
    const env = this.parseEnvString(envString)
    return await this.run(this.localExecutablePath, stringArgs, env)
  }
)

When(
  'I run cucumber-js with env `{}`',
  { timeout: 10000 },
  async function (this: World, envString: string) {
    const env = this.parseEnvString(envString)
    return await this.run(this.localExecutablePath, [], env)
  }
)

When(
  'I run cucumber-js with all formatters',
  { timeout: 10000 },
  async function (this: World) {
    const args = '--format html:html.out --format json:json.out'
    const renderedArgs = Mustache.render(args, this)
    const stringArgs = stringArgv(renderedArgs)
    return await this.run(this.localExecutablePath, stringArgs)
  }
)

When(
  'I run cucumber-js with all formatters and `{}`',
  { timeout: 10000 },
  async function (this: World, args: string) {
    if (doesNotHaveValue(args)) {
      args = ''
    }
    // message is always outputted as part of run
    const formats = ['html:html.out', 'json:json.out']
    args += ' ' + formats.map((f) => `--format ${f}`).join(' ')
    const renderedArgs = Mustache.render(args, this)
    const stringArgs = stringArgv(renderedArgs)
    return await this.run(this.localExecutablePath, stringArgs)
  }
)

Then('it passes', () => {}) // eslint-disable-line @typescript-eslint/no-empty-function

Then('it fails', function (this: World) {
  const actualCode: number = doesHaveValue(this.lastRun.error)
    ? this.lastRun.error.code
    : 0

  expect(actualCode).not.to.eql(
    0,
    `Expected non-zero exit status, but got ${actualCode}`
  )
  this.verifiedLastRunError = true
})

Then('it outputs the text:', function (this: World, text: string) {
  const actualOutput = normalizeText(this.lastRun.output)
  const expectedOutput = normalizeText(text)
  expect(actualOutput).to.eql(expectedOutput)
})

Then('the output contains the text:', function (this: World, text: string) {
  const actualOutput = normalizeText(this.lastRun.output)
  const expectedOutput = normalizeText(text)
  expect(actualOutput).to.include(expectedOutput)
})

Then(
  'the output contains these types and quantities of message:',
  function (this: World, expectedMessages: DataTable) {
    const envelopes = this.lastRun.output
      .split('\n')
      .filter((line) => !!line)
      .map((line) => JSON.parse(line))
    expectedMessages.rows().forEach(([type, count]) => {
      expect(envelopes.filter((envelope) => !!envelope[type])).to.have.length(
        Number(count),
        `Didn't find expected number of ${type} messages`
      )
    })
  }
)

Then(
  'the output does not contain the text:',
  function (this: World, text: string) {
    const actualOutput = normalizeText(this.lastRun.output)
    const expectedOutput = normalizeText(text)
    expect(actualOutput).not.to.include(expectedOutput)
  }
)

Then(
  'the error output contains the text snippets:',
  function (this: World, table: DataTable) {
    const actualOutput = normalizeText(this.lastRun.errorOutput)
    table.rows().forEach((row) => {
      const expectedOutput = normalizeText(row[0])
      expect(actualOutput).to.include(expectedOutput)
    })
  }
)

Then(
  'the error output contains the text:',
  function (this: World, text: string) {
    const actualOutput = normalizeText(this.lastRun.errorOutput)
    const expectedOutput = normalizeText(text)
    expect(actualOutput).to.include(expectedOutput)
  }
)

Then(
  'the error output does not contain the text:',
  function (this: World, text: string) {
    const actualOutput = normalizeText(this.lastRun.errorOutput)
    const expectedOutput = normalizeText(text)
    expect(actualOutput).not.to.include(expectedOutput)
  }
)

Then('I see the version of Cucumber', function (this: World) {
  const actualOutput = this.lastRun.output
  const expectedOutput = `${version as string}\n`
  expect(actualOutput).to.eql(expectedOutput)
})

Then('I see the help text for Cucumber', function (this: World) {
  const actualOutput = this.lastRun.output
  const expectedOutput = 'Usage: cucumber-js'
  expect(actualOutput).to.include(expectedOutput)
})
