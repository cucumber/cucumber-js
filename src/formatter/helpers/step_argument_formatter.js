import Table from 'cli-table3'

function formatDataTable(dataTable) {
  const table = new Table({
    chars: {
      bottom: '',
      'bottom-left': '',
      'bottom-mid': '',
      'bottom-right': '',
      left: '|',
      'left-mid': '',
      mid: '',
      'mid-mid': '',
      middle: '|',
      right: '|',
      'right-mid': '',
      top: '',
      'top-left': '',
      'top-mid': '',
      'top-right': '',
    },
    style: {
      border: [],
      'padding-left': 1,
      'padding-right': 1,
    },
  })
  const rows = dataTable.rows.map(row =>
    row.cells.map(cell =>
      cell.value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n')
    )
  )
  table.push(...rows)
  return table.toString()
}

function formatDocString(docString) {
  return `"""\n${docString.content}\n"""`
}

export function formatStepArgument(arg) {
  if (arg.dataTable) {
    return formatDataTable(arg.dataTable)
  } else {
    return formatDocString(arg.docString)
  }
}
