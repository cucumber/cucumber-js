import { expect } from 'chai'
import { type DataTable, Given } from '../../../src'

Given('a step with a data table a doc string', (table: DataTable, string: string) => {
  expect(table.raw()).to.deep.eq([['hello']])
  expect(string).to.eq('world')
})

Given('a step with a doc string a data table', (string: string, table: DataTable) => {
  expect(string).to.eq('hello')
  expect(table.raw()).to.deep.eq([['world']])
})
