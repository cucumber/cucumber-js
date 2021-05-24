import assert from 'assert'
import { Given, DataTable, Then, When, World } from '../../../src'

Given('some TypeScript code:', function (dataTable: DataTable) {
  assert(dataTable)
})

Given('some classic Gherkin:', function (gherkin: string) {
  assert(gherkin)
})

When(
  'we use a data table and attach something and then {word}',
  async function (this: World, word: string, dataTable: DataTable) {
    await this.log('We are logging some plain text')
    assert(dataTable)
    if (word === 'fail') {
      throw new Error('You asked me to fail')
    }
  }
)

Then('this might or might not run', function () {
  // no-op
})
