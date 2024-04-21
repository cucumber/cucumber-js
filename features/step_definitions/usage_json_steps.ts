import path from 'node:path'
import { expect } from 'chai'
import { DataTable, Then } from '../../'
import { World } from '../support/world'
import { IUsage } from '../../src/formatter/helpers/usage_helpers'

Then('it outputs the usage data:', function (this: World, table: DataTable) {
  const usageData: IUsage[] = JSON.parse(this.lastRun.output)
  table.hashes().forEach((row) => {
    const rowUsage = usageData.find(
      (datum) =>
        datum.pattern === row.PATTERN && datum.patternType === row.PATTERN_TYPE
    )
    expect(rowUsage).to.be.an('object')
    expect(rowUsage.line).to.eql(parseInt(row.LINE))
    expect(rowUsage.matches).to.have.lengthOf(Number(row['NUMBER OF MATCHES']))
    expect(rowUsage.uri).to.eql(path.normalize(row.URI))
  })
})
