/* eslint-disable babel/new-cap */

import { defineSupportCode } from '../../'
import { expect } from 'chai'
import { normalizeEventProtocolOutput } from '../support/event_protocol_output_helpers'
import fs from 'mz/fs'
import path from 'path'

defineSupportCode(function({ Then }) {
  Then('the output matches the fixture {string}', async function(filePath) {
    const fixturePath = path.join(__dirname, '..', 'fixtures', filePath)
    const expected = await fs.readFile(fixturePath, 'utf8')
    const normalizedActual = normalizeEventProtocolOutput(this.lastRun.output)
    const normalizedExpected = normalizeEventProtocolOutput(expected)
    expect(normalizedActual).to.eql(normalizedExpected)
  })
})
