import { describe, it } from 'mocha'
import { expect, use } from 'chai'
import chaiExclude from 'chai-exclude'
import globby from 'globby'
import fs from 'fs'
import ndjsonParse from 'ndjson-parse'
import path from 'path'
import { PassThrough } from 'stream'
import { Cli } from '../lib'
import toString from 'stream-to-string'

const PROJECT_PATH = path.join(__dirname, '..')
const CCK_FEATURES_PATH = 'node_modules/@cucumber/compatibility-kit/features'

use(chaiExclude)

describe('Cucumber Compatibility Kit', () => {
  globby.sync([`${CCK_FEATURES_PATH}/**/*.ndjson`]).forEach(fixturePath => {
    const suiteName = /^.+\/(.+)\.ndjson$/.exec(fixturePath)[1]
    it(`passes the cck suite for '${suiteName}'`, async () => {
      const args = [
        'node',
        path.join(PROJECT_PATH, 'bin', 'cucumber-js'),
      ].concat([
        `${CCK_FEATURES_PATH}/${suiteName}/${suiteName}.feature`,
        '--require-module',
        'ts-node/register',
        '--require',
        `compatibility/${suiteName}/${suiteName}.ts`,
        '--predictable-ids',
        '--format',
        'message',
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

      const actualMessages = ndjsonParse(await toString(stdout))
      const expectedMessages = ndjsonParse(
        fs.readFileSync(fixturePath, { encoding: 'utf-8' })
      )
      expect(actualMessages)
        .excludingEvery('uri')
        .to.deep.eq(expectedMessages)
    }).timeout(10000)
  })
})
