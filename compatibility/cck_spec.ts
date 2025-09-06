import fs from 'node:fs'
import path from 'node:path'
import { PassThrough, Writable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { describe, it } from 'mocha'
import { config, expect, use } from 'chai'
import chaiExclude from 'chai-exclude'
import { glob } from 'glob'
import * as messages from '@cucumber/messages'
import * as messageStreams from '@cucumber/message-streams'
import { Envelope } from '@cucumber/messages'
import { ignorableKeys } from '../features/support/formatter_output_helpers'
import { runCucumber, IRunConfiguration } from '../src/api'

const PROJECT_PATH = path.join(__dirname, '..')
const CCK_FEATURES_PATH = 'node_modules/@cucumber/compatibility-kit/features'
const CCK_IMPLEMENTATIONS_PATH = 'compatibility/features'

const UNSUPPORTED = [
  'global-hooks-attachments',
  'global-hooks-beforeall-error',
  'global-hooks-afterall-error',
]

config.truncateThreshold = 100
use(chaiExclude)

describe('Cucumber Compatibility Kit', () => {
  const directories = glob.sync(`${CCK_FEATURES_PATH}/*`, { nodir: false })

  for (const directory of directories) {
    const suite = path.basename(directory)

    if (UNSUPPORTED.includes(suite)) {
      it.skip(suite, () => {})
      continue
    }

    it(suite, async () => {
      const actualMessages: Envelope[] = []
      const stdout = new PassThrough()
      const stderr = new PassThrough()
      const runConfiguration: IRunConfiguration = {
        sources: {
          defaultDialect: 'en',
          paths: [
            `${CCK_FEATURES_PATH}/${suite}/*.feature`,
            `${CCK_FEATURES_PATH}/${suite}/*.feature.md`,
          ],
          names: [],
          tagExpression: '',
          order: suite === 'multiple-features-reversed' ? 'reverse' : 'defined',
          shard: '',
        },
        support: {
          requireModules: ['ts-node/register'],
          requirePaths: [`${CCK_IMPLEMENTATIONS_PATH}/${suite}/*.ts`],
        },
        runtime: {
          dryRun: false,
          failFast: false,
          filterStacktraces: true,
          parallel: 0,
          retry: suite === 'retry' ? 2 : 0,
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
      await pipeline(
        fs.createReadStream(path.join(directory, suite + '.ndjson'), {
          encoding: 'utf-8',
        }),
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
  }
})
