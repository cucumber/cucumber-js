import _ from 'lodash'

const truths = ["true", "TRUE", "True", "yes", "y", "1"];
const trueFalse = v => !!~truths.indexOf(v);
const asIs = v => v;

const types = {
  "string":  asIs,
  "str":     asIs,
  "number":  Number,
  "int":     parseInt,
  "integer": parseInt,
  "double":  parseFloat,
  "float":   parseFloat,
  "bool":    trueFalse,
  "boolean": trueFalse,
  "y/n":     trueFalse,
  "bit":     trueFalse,
  "date":    Date
};

export default class DataTable {
  constructor(gherkinData) {
    this.rawTable = gherkinData.rows.map((row) => row.cells.map((cell) => cell.value))
  }

  hashes() {
    const copy = this.raw()
    const keys = copy[0]
    const valuesArray = copy.slice(1)
    return valuesArray.map((values) => _.zipObject(keys, values))
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
    const everyRowHasTwoColumns = _.every(rows, (row) => row.length === 2)
    if (!everyRowHasTwoColumns) {
      throw new Error('rowsHash can only be called on a data table where all rows have exactly two columns')
    }
    return _.fromPairs(rows)
  }

  map() {
    return this.rawTable.reduce( (h,r) => {
          if (r.length == 1 ) r = r.concat(['bool', true])
          if (r.length == 2 ) r = [r[0], "string", r[1]]
          h[r[0] ] = (types[r[1].toLowerCase()] || asIs)(r[2])
          return h
      }, 
      {}
    )
  }
}
