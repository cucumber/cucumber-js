import assert from 'node:assert'
import { type DataTable, Given, Then, When, type World } from '../../../src'

Given('some TypeScript code:', (dataTable: DataTable) => {
  assert(dataTable)
})

Given('some classic Gherkin:', (gherkin: string) => {
  assert(gherkin)
})

When(
  'we use a data table and attach something and then {word}',
  async function (this: World, word: string, dataTable: DataTable) {
    assert(dataTable)
    await this.log(`We are logging some plain text (${word})`)
    if (word === 'fail') {
      throw new Error('You asked me to fail')
    }
  }
)

Then('this might or might not run', () => {
  // no-op
})
