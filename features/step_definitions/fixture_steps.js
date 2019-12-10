/* eslint-disable babel/new-cap */

import { Then } from '../../'
import { expect } from 'chai'
import {
  normalizeProtobufOutput,
  normalizeJsonOutput,
} from '../support/formatter_output_helpers'
import fs from 'mz/fs'
import path from 'path'

Then(
  'the {string} formatter output matches the fixture {string}',
  async function(formatter, filePath) {
    let actual
    if (formatter === 'protobuf') {
      actual = this.lastRun.envelopes.map(e => e.toJSON())
      actual = normalizeProtobufOutput(actual, this.tmpDir)
    } else {
      const actualPath = path.join(this.tmpDir, `${formatter}.out`)
      actual = await fs.readFile(actualPath, 'utf8')
      if (formatter === 'json') {
        actual = normalizeJsonOutput(actual, this.tmpDir)
      }
    }
    const fixturePath = path.join(__dirname, '..', 'fixtures', filePath)
    const expected = require(fixturePath)
    expect(actual).to.eql(expected)
  }
)
