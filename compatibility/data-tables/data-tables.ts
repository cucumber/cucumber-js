import { When, Then, DataTable, World } from '../..'

When('the following table is transposed:', function(
  this: World,
  table: DataTable
) {
  // this.transposed = table.transpose()
})

Then('it should be:', function(this: World, expected: DataTable) {
  // this.transposed.diff(expected)
})
