import { describe, it } from 'mocha'
import { config, expect, use } from 'chai'
import chaiExclude from 'chai-exclude'
import glob from 'glob'
import fs from 'fs'
import path from 'path'
import { PassThrough, pipeline, Writable } from 'stream'
import toString from 'stream-to-string'
import {
  ignorableKeys,
  normalizeMessageOutput,
} from '../features/support/formatter_output_helpers'
import * as messages from '@cucumber/messages'
import * as messageStreams from '@cucumber/message-streams'
import util from 'util'
import { runCucumber } from '../src/run'
import { IRunConfiguration } from '../src/configuration'

const asyncPipeline = util.promisify(pipeline)
const PROJECT_PATH = path.join(__dirname, '..')
const CCK_FEATURES_PATH = 'node_modules/@cucumber/compatibility-kit/features'
const CCK_IMPLEMENTATIONS_PATH = 'compatibility/features'

config.truncateThreshold = 100
use(chaiExclude)

describe('Cucumber Compatibility Kit', () => {
  glob.sync(`${CCK_FEATURES_PATH}/**/*.ndjson`).forEach((fixturePath) => {
    const match = /^.+\/(.+)(\.feature(?:\.md)?)\.ndjson$/.exec(fixturePath)
    const suiteName = match[1]
    const extension = match[2]
    it(`passes the cck suite for '${suiteName}'`, async () => {
      const stdout = new PassThrough()
      const runConfiguration: IRunConfiguration = {
        sources: {
          paths: [`${CCK_FEATURES_PATH}/${suiteName}/${suiteName}${extension}`],
        },
        support: {
          transpileWith: ['ts-node/register'],
          paths: [`${CCK_IMPLEMENTATIONS_PATH}/${suiteName}/${suiteName}.ts`],
        },
        formats: {
          stdout: 'message',
        },
        runtime: {
          dryRun: false,
          failFast: false,
          filterStacktraces: true,
          parallel: false,
          retry: suiteName === 'retry' ? { count: 2 } : false,
          strict: true,
          worldParameters: {},
        },
      }
      try {
        await runCucumber(runConfiguration, {
          cwd: PROJECT_PATH,
          stdout,
          env: process.env,
        })
      } catch (ignored) {
        console.error(ignored)
      }
      stdout.end()

      const rawOutput = await toString(stdout)
      const actualMessages = normalize(
        rawOutput
          .split('\n')
          .filter((line) => line.trim() !== '')
          .map((line) => JSON.parse(line))
      )

      const expectedMessages: messages.Envelope[] = []
      await asyncPipeline(
        fs.createReadStream(fixturePath, { encoding: 'utf-8' }),
        new messageStreams.NdjsonToMessageStream(),
        new Writable({
          objectMode: true,
          write(envelope: messages.Envelope, _: BufferEncoding, callback) {
            expectedMessages.push(envelope)
            callback()
          },
        })
      )

      expect(actualMessages)
        .excludingEvery(ignorableKeys)
        .to.deep.eq(expectedMessages)
    })
  })
})

function normalize(messages: any[]): any[] {
  messages = normalizeMessageOutput(
    messages,
    path.join(PROJECT_PATH, 'compatibility')
  )
  return messages
}
