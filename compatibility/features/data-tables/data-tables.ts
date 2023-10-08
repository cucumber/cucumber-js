import { expect } from 'chai'
import { When, Then, DataTable } from '../../../src'

type World = {
  transposed: DataTable
}

When(
  'the following table is transposed:',
  function (this: World, table: DataTable) {
    this.transposed = table.transpose()
  }
)

Then('it should be:', function (this: World, expected: DataTable) {
  expect(this.transposed.raw()).to.deep.eq(expected.raw())
})
