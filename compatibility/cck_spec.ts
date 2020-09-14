import { describe, it } from 'mocha'
import { config, expect, use } from 'chai'
import chaiExclude from 'chai-exclude'
import glob from 'glob'
import fs from 'fs'
import ndjsonParse from 'ndjson-parse'
import path from 'path'
import { PassThrough } from 'stream'
import { Cli } from '../lib'
import toString from 'stream-to-string'
import { doesHaveValue, doesNotHaveValue } from '../src/value_checker'
import { normalizeMessageOutput } from '../features/support/formatter_output_helpers'

const PROJECT_PATH = path.join(__dirname, '..')
const CCK_FEATURES_PATH = 'node_modules/@cucumber/compatibility-kit/features'
const CCK_IMPLEMENTATIONS_PATH = 'compatibility/features'

config.truncateThreshold = 100
use(chaiExclude)

describe('Cucumber Compatibility Kit', () => {
  glob.sync(`${CCK_FEATURES_PATH}/**/*.ndjson`).forEach((fixturePath) => {
    const suiteName = /^.+\/(.+)\.ndjson$/.exec(fixturePath)[1]
    it(`passes the cck suite for '${suiteName}'`, async () => {
      const args = [
        'node',
        path.join(PROJECT_PATH, 'bin', 'cucumber-js'),
      ].concat([
        `${CCK_FEATURES_PATH}/${suiteName}/${suiteName}.feature`,
        '--require',
        `${CCK_IMPLEMENTATIONS_PATH}/${suiteName}/${suiteName}.ts`,
        '--profile',
        'cck',
      ])
      const stdout = new PassThrough()
      try {
        await new Cli({
          argv: args,
          cwd: PROJECT_PATH,
          stdout,
        }).run()
      } catch (ignored) {
        console.error(ignored)
      }
      stdout.end()

      const rawOutput = await toString(stdout)
      const actualMessages = normalize(ndjsonParse(rawOutput))
      const expectedMessages = ndjsonParse(
        fs.readFileSync(fixturePath, { encoding: 'utf-8' })
      )
      expect(actualMessages)
        .excludingEvery([
          'meta',
          // sources
          'uri',
          'line',
          // ids
          'astNodeId',
          'astNodeIds',
          'hookId',
          'id',
          'pickleId',
          'pickleStepId',
          'stepDefinitionIds',
          'testCaseId',
          'testCaseStartedId',
          'testStepId',
          // time
          'nanos',
          'seconds',
          // errors
          'message',
        ])
        .to.deep.eq(expectedMessages)
    })
  })
})

function normalize(messages: any[]): any[] {
  messages = normalizeMessageOutput(
    messages,
    path.join(PROJECT_PATH, 'compatibility')
  )
  const testCases: any[] = messages.filter((message) =>
    doesHaveValue(message.testCase)
  )
  const everythingElse: any[] = messages.filter((message) =>
    doesNotHaveValue(message.testCase)
  )
  const testRunStarted = everythingElse.findIndex((message) =>
    doesHaveValue(message.testRunStarted)
  )
  // move all `testCase` messages to just after `testRunStarted`
  everythingElse.splice(testRunStarted + 1, 0, ...testCases)
  return everythingElse
}
