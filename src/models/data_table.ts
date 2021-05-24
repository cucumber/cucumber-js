import _ from 'lodash'
import * as messages from '@cucumber/messages'

export default class DataTable {
  private readonly rawTable: string[][]

  constructor(sourceTable: messages.PickleTable | string[][]) {
    if (sourceTable instanceof Array) {
      this.rawTable = sourceTable
    } else {
      this.rawTable = sourceTable.rows.map((row) =>
        row.cells.map((cell) => cell.value)
      )
    }
  }

  hashes(): any[] {
    const copy = this.raw()
    const keys = copy[0]
    const valuesArray = copy.slice(1)
    return valuesArray.map((values) => _.zipObject(keys, values))
  }

  raw(): string[][] {
    return this.rawTable.slice(0)
  }

  rows(): string[][] {
    const copy = this.raw()
    copy.shift()
    return copy
  }

  rowsHash(): Record<string, string> {
    const rows = this.raw()
    const everyRowHasTwoColumns = _.every(rows, (row) => row.length === 2)
    if (!everyRowHasTwoColumns) {
      throw new Error(
        'rowsHash can only be called on a data table where all rows have exactly two columns'
      )
    }
    return _.fromPairs(rows)
  }

  transpose(): DataTable {
    const transposed = this.rawTable[0].map((x, i) =>
      this.rawTable.map((y) => y[i])
    )
    return new DataTable(transposed)
  }
}
