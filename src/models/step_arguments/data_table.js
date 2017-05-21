import _ from 'lodash'
import Table from 'cli-table'

const truths = ['true', 'yes', 'y', '1']
const falses = ['false', 'no', 'n', '0']
const trueFalse = (v) => {
    const lower = v.toLowerCase()
    if (~truths.indexOf(lower)) return true
    if (~falses.indexOf(lower)) return false
    throw new Error([
      '\'' + v + '\' is not a legal boolean value.',
      'Boolean values are case insensitive and may accept any of the following forms:',
      ' - true/false',
      ' - yes/no',
      ' - y/n',
      ' - 1/0'
    ].join('\n'))
}
const asIs = _.identity
const list = (v) => v.split(',')
const date = (v) => new Date(v)

const types = {
  'string':  asIs,
  '':        asIs,
  'int':     parseInt,
  'integer': parseInt,
  'double':  parseInt,
  'float':   parseFloat,
  'number':  parseFloat,
  'bool':    trueFalse,
  'boolean': trueFalse,
  'y/n':     trueFalse,
  'bit':     trueFalse,
  date,
  'datetime':date,
  'array':   list,
  list,
  'json':    JSON.parse
}

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

  typedRowsHash() {
    const erroredRowFormat = ( () => {
      const pad = '             '.split('').join('                     ')
      const colPadder = () => {
        let colLen = 0
        return (v) => {
          colLen = Math.max(colLen, v.length)
          return {toString: () => (v + pad).substr(0, colLen)}
        }
      }
      const cols = [colPadder(), colPadder(), colPadder()]
      return (row) => {
        return cols.map( (padder, i) => padder( row[i] ) )
      }
    })()
    const rows = this.raw()
    const everyRowHasThreeColumns = _.every(rows, (row) => row.length === 3)
    if (!everyRowHasThreeColumns) {
      throw new Error('typedRowsHash can only be used on a data table where all rows have exactly 3 columns')
    }
    const unrecognizedTypes = rows.filter((row) => typeof types[row[1].toLowerCase()] !== 'function')
    if (unrecognizedTypes.length) {
      throw new Error('typedRowsHash does not support type(s) in rows: \n\t| ' +
        unrecognizedTypes.map(erroredRowFormat)
          .map((row) => row.join(' | '))
          .join(' |\n\t| ') + ' |'
      )
    }
    return this.rawTable.reduce( (h, r) => {
      h[ r[0] ] = (types[r[1].toLowerCase()] || asIs)(r[2])
      return h
    }, {})
  }
}