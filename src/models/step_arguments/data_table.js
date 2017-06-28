import _ from 'lodash'

export default class DataTable {
  constructor(gherkinData) {
    this.rawTable = gherkinData.rows.map(row =>
      row.cells.map(cell => cell.value)
    )
  }

  hashes() {
    const copy = this.raw()
    const keys = copy[0]
    const valuesArray = copy.slice(1)
    return valuesArray.map(values => _.zipObject(keys, values))
  }

  raw() {
    return this.rawTable.slice(0)
  }

  rows() {
    const copy = this.raw()
    copy.shift()
    return copy
  }

  rowsHash() {
    const rows = this.raw()
    const everyRowHasTwoColumns = _.every(rows, row => row.length === 2)
    if (!everyRowHasTwoColumns) {
      throw new Error(
        'rowsHash can only be called on a data table where all rows have exactly two columns'
      )
    }
    return _.fromPairs(rows)
  }
}
