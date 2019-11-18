import Table from 'cli-table3'

function formatDataTable(arg) {
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
  table.push(...arg.rows)
  return table.toString()
}

function formatDocString(arg) {
  return `"""\n${arg.content}\n"""`
}

export function formatStepArgument(arg) {
  if (arg.rows) {
    return formatDataTable(arg)
  } else {
    return formatDocString(arg)
  }
}
