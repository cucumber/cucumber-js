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

  hashes(): Record<string, string>[] {
    const copy = this.raw()
    const keys = copy[0]
    const valuesArray = copy.slice(1)
    return valuesArray.map((values) => {
      const rowObject: Record<string, string> = {}
      keys.forEach((key, index) => (rowObject[key] = values[index]))
      return rowObject
    })
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
    const everyRowHasTwoColumns = rows.every((row) => row.length === 2)
    if (!everyRowHasTwoColumns) {
      throw new Error(
        'rowsHash can only be called on a data table where all rows have exactly two columns'
      )
    }
    const result: Record<string, string> = {}
    rows.forEach((x) => (result[x[0]] = x[1]))
    return result
  }

  transpose(): DataTable {
    const transposed = this.rawTable[0].map((x, i) =>
      this.rawTable.map((y) => y[i])
    )
    return new DataTable(transposed)
  }
}
