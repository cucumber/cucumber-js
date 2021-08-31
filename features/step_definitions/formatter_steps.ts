import { Then } from '../../'
import { expect } from 'chai'
import {
  normalizeJsonOutput,
  normalizeMessageOutput,
  stripMetaMessages,
} from '../support/formatter_output_helpers'
import fs from 'mz/fs'
import path from 'path'
import { World } from '../support/world'

Then(
  'the message formatter output matches the fixture {string}',
  async function (this: World, filePath: string) {
    let actual = this.lastRun.envelopes // .map((e: Envelope) => JSON.stringify(e))
    actual = normalizeMessageOutput(actual, this.tmpDir)
    actual = stripMetaMessages(actual)
    const fixturePath = path.join(__dirname, '..', 'fixtures', filePath)
    const expected = require(fixturePath) // eslint-disable-line @typescript-eslint/no-var-requires
    try {
      expect(actual).to.eql(expected)
    } catch (e) {
      if (process.env.GOLDEN) {
        await fs.writeFile(
          fixturePath + '.ts',
          'module.exports = ' + JSON.stringify(actual, null, 2),
          'utf-8'
        )
      } else {
        throw e
      }
    }
  }
)

Then(
  'the json formatter output matches the fixture {string}',
  async function (this: World, filePath: string) {
    const now = Date.now()
    const actualPath = path.join(this.tmpDir, `json.out`)
    const actualJson = await fs.readFile(actualPath, 'utf8')
    const actual = normalizeJsonOutput(actualJson, this.tmpDir)
    const fixturePath = path.join(__dirname, '..', 'fixtures', filePath)
    const expected = require(fixturePath) // eslint-disable-line @typescript-eslint/no-var-requires
    try {
      // because time is generate in running step in json.out will less than time now
      if (actual.length || expected.length) {
        ;(actual.length > expected.length ? actual : expected).forEach(
          (_: any, index: number) => {
            expect(actual[index].time || 0).to.lessThan(now)
            delete actual[index].time
            delete expected[index]?.time
          }
        )
      }
      expect(actual).to.eql(expected)
    } catch (e) {
      if (process.env.GOLDEN) {
        await fs.writeFile(
          fixturePath + '.ts',
          'module.exports = ' + JSON.stringify(actual, null, 2),
          'utf-8'
        )
      } else {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        e.message = `${e.message}\n\nTry running again with GOLDEN=1 if you believe the fixtures need to be overwritten with actual results`
        throw e
      }
    }
  }
)

Then('the html formatter output is complete', async function (this: World) {
  const actualPath = path.join(this.tmpDir, `html.out`)
  const actual = await fs.readFile(actualPath, 'utf8')
  expect(actual).to.contain('<html lang="en">')
  expect(actual).to.contain('</html>')
})
