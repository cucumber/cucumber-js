/* eslint-disable babel/new-cap */

import _ from 'lodash'
import {defineSupportCode} from '../../'
import {expect} from 'chai'
import fs from 'fs'
import path from 'path'

defineSupportCode(({Then}) => {
  Then('it outputs the usage data:', function (table) {
    const usageData = JSON.parse(this.lastRun.output)
    table.hashes().forEach((row, index) => {
      const rowUsage = _.find(usageData, (datum) => {
        return datum.pattern === row['PATTERN']
      })
      expect(rowUsage).to.exist
      expect(rowUsage.line).to.eql(parseInt(row['LINE']))
      expect(rowUsage.matches).to.have.lengthOf(row['NUMBER OF MATCHES'])
      const expectedUri = fs.realpathSync(path.join(this.tmpDir, row['URI']))
      expect(rowUsage.uri).to.eql(expectedUri)
    })
  })
})
