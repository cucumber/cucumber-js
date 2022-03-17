import { describe, it } from 'mocha'
import { config, expect, use } from 'chai'
import chaiExclude from 'chai-exclude'
import glob from 'glob'
import fs from 'fs'
import path from 'path'
import { PassThrough, pipeline, Writable } from 'stream'
import { ignorableKeys } from '../features/support/formatter_output_helpers'
import * as messages from '@cucumber/messages'
import * as messageStreams from '@cucumber/message-streams'
import util from 'util'
import { runCucumber, IRunConfiguration } from '../src/api'
import { Envelope } from '@cucumber/messages'

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
      const actualMessages: Envelope[] = []
      const stdout = new PassThrough()
      const stderr = new PassThrough()
      const runConfiguration: IRunConfiguration = {
        sources: {
          defaultDialect: 'en',
          paths: [`${CCK_FEATURES_PATH}/${suiteName}/${suiteName}${extension}`],
          names: [],
          tagExpression: '',
          order: 'defined',
        },
        support: {
          requireModules: ['ts-node/register'],
          requirePaths: [
            `${CCK_IMPLEMENTATIONS_PATH}/${suiteName}/${suiteName}.ts`,
          ],
          importPaths: [],
        },
        runtime: {
          dryRun: false,
          failFast: false,
          filterStacktraces: true,
          parallel: 0,
          retry: suiteName === 'retry' ? 2 : 0,
          retryTagFilter: '',
          strict: true,
          worldParameters: {},
        },
        formats: {
          stdout: 'summary',
          files: {},
          options: {},
          publish: false,
        },
      }
      await runCucumber(
        runConfiguration,
        {
          cwd: PROJECT_PATH,
          stdout,
          stderr,
        },
        (message) => actualMessages.push(JSON.parse(JSON.stringify(message)))
      )
      stdout.end()
      stderr.end()

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
