import { expect } from 'chai'
import path from 'path'

import { DataTable, Then } from '../../'
import { IUsage } from '../../src/formatter/helpers/usage_helpers'
import { World } from '../support/world'

Then('it outputs the usage data:', function (this: World, table: DataTable) {
  const usageData: IUsage[] = JSON.parse(this.lastRun.output)
  table.hashes().forEach((row: any) => {
    const rowUsage = usageData.find(
      (datum) =>
        datum.pattern === row.PATTERN && datum.patternType === row.PATTERN_TYPE
    )
    expect(rowUsage).to.be.an('object')
    expect(rowUsage.line).to.eql(parseInt(row.LINE))
    expect(rowUsage.matches).to.have.lengthOf(row['NUMBER OF MATCHES'])
    expect(rowUsage.uri).to.eql(path.normalize(row.URI))
  })
})
