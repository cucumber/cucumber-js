/* eslint-disable babel/new-cap */

import { Then } from '../../'
import { expect } from 'chai'
import { normalizeEventProtocolOutput } from '../support/event_protocol_output_helpers'
import fs from 'mz/fs'
import path from 'path'

Then('the output matches the fixture {string}', async function(filePath) {
  const fixturePath = path.join(__dirname, '..', 'fixtures', filePath)
  const expected = await fs.readFile(fixturePath, 'utf8')
  const normalizedActual = normalizeEventProtocolOutput(
    this.lastRun.output,
    this.tmpDir
  )
  const normalizedExpected = normalizeEventProtocolOutput(expected, this.tmpDir)
  expect(normalizedActual).to.eql(normalizedExpected)
})
