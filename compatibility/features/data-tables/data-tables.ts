import { expect } from 'chai'

import { DataTable, Then, When } from '../../../src'

When(
  'the following table is transposed:',
  function (this: any, table: DataTable) {
    this.transposed = table.transpose()
  }
)

Then('it should be:', function (this: any, expected: DataTable) {
  expect(this.transposed.raw()).to.deep.eq(expected.raw())
})
