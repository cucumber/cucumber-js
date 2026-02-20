import path from 'node:path'
import { expect, use } from 'chai'
import chaiExclude from 'chai-exclude'
import fs from 'mz/fs'
import { Then, DataTable } from '../../'
import {
  ignorableKeys,
  normalizeJsonOutput,
  normalizeMessageOutput,
  stripMetaMessages,
} from '../support/formatter_output_helpers'
import { World } from '../support/world'

use(chaiExclude)

Then(
  'the message formatter output matches the fixture {string}',
  async function (this: World, filePath: string) {
    let actual = this.lastRun.envelopes // .map((e: Envelope) => JSON.stringify(e))
    actual = normalizeMessageOutput(actual, this.tmpDir)
    actual = stripMetaMessages(actual)
    const fixturePath = path.join(__dirname, '..', 'fixtures', filePath)
    const expected = require(fixturePath) // eslint-disable-line @typescript-eslint/no-require-imports
    try {
      expect(actual).excludingEvery(ignorableKeys).to.deep.eq(expected)
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
    const actualPath = path.join(this.tmpDir, `json.out`)
    const actualJson = await fs.readFile(actualPath, 'utf8')
    const actual = normalizeJsonOutput(actualJson, this.tmpDir)
    const fixturePath = path.join(__dirname, '..', 'fixtures', filePath)
    const expected = require(fixturePath) // eslint-disable-line @typescript-eslint/no-require-imports
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

Then(
  'the formatter has no externalised attachments',
  async function (this: World) {
    const actual = fs
      .readdirSync(this.tmpDir)
      .filter((filename) => filename.startsWith('attachment-')).length
    expect(actual).to.eq(0)
  }
)

Then(
  'the formatter has these external attachments:',
  async function (this: World, table: DataTable) {
    const actual = fs
      .readdirSync(this.tmpDir)
      .filter((filename) => filename.startsWith('attachment-'))
      .map((filename) =>
        fs.readFileSync(path.join(this.tmpDir, filename), { encoding: 'utf-8' })
      )
    actual.sort()
    expect(actual).to.deep.eq(table.raw().map((row) => row[0]))
  }
)
