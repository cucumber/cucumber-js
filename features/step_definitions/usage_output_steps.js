import _ from 'lodash'
import {defineSupportCode} from '../../'
import {expect} from 'chai'
import {getScenarioNames, getSteps, findScenario, findStep} from '../support/json_output_helpers'

defineSupportCode(({Then}) => {
  Then('the usage output is:', function (table) {
    const output = JSON.parse(this.lastRun.output)
    const rows = table.hashes()
    expect(output.length).to.eql(rows.length)
    rows.forEach((row, index) => {
      expect(output[index].pattern).to.eql(output[index].pattern)
      expect(output[index].matches.length).to.eql(parseInt(row['NUMBER OF MATCHES']))
      if (row['MEAN DURATION']) {
        expect(output[index].meanDuration).to.be.within(row['MEAN DURATION'], row['MEAN DURATION'] + 10)
      } else {
        expect(output[index].meanDuration).to.be.undefined
      }
    })
  })
})
