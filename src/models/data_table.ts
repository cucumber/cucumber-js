import _, { Dictionary } from 'lodash'
import { messages } from 'cucumber-messages'

export default class DataTable {
  private readonly rawTable: string[][]

  constructor(pickleTable: messages.PickleStepArgument.IPickleTable) {
    this.rawTable = pickleTable.rows.map(row =>
      row.cells.map(cell => cell.value)
    )
  }

  hashes(): any[] {
    const copy = this.raw()
    const keys = copy[0]
    const valuesArray = copy.slice(1)
    return valuesArray.map(values => _.zipObject(keys, values))
  }

  raw(): string[][] {
    return this.rawTable.slice(0)
  }

  rows(): string[][] {
    const copy = this.raw()
    copy.shift()
    return copy
  }

  rowsHash(): Dictionary<any> {
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
