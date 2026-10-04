import { expect } from 'chai'
import { type DataTable, Given } from '../../../src'

Given('a {string} with a table', (string: string, table: DataTable) => {
  expect(string).to.eq('Cucumber')
  expect(table.raw()).to.deep.eq([['Species', 'Cucumis sativus']])
})
