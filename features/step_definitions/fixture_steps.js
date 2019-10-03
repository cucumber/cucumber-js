/* eslint-disable babel/new-cap */

import { Then } from '../../'
import { expect } from 'chai'
import {
  normalizeEventProtocolOutput,
  normalizeJsonOutput,
} from '../support/formatter_output_helpers'
import fs from 'mz/fs'
import path from 'path'

Then(
  'the {string} formatter output matches the fixture {string}',
  async function(formatter, filePath) {
    const actualPath = path.join(this.tmpDir, `${formatter}.out`)
    let actual = await fs.readFile(actualPath, 'utf8')
    const fixturePath = path.join(__dirname, '..', 'fixtures', filePath)
    const expected = require(fixturePath)
    if (formatter === 'event-protocol') {
      actual = normalizeEventProtocolOutput(actual, this.tmpDir)
    } else if (formatter === 'json') {
      actual = normalizeJsonOutput(actual, this.tmpDir)
    }
    expect(actual).to.eql(expected)
  }
)
