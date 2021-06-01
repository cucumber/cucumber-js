import Table from 'cli-table3'
import { parseStepArgument } from '../../step_arguments'
import * as messages from '@cucumber/messages'

function formatDataTable(dataTable: messages.PickleTable): string {
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
  const rows = dataTable.rows.map((row) =>
    row.cells.map((cell) =>
      cell.value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n')
    )
  )
  table.push(...rows)
  return table.toString()
}

function formatDocString(docString: messages.PickleDocString): string {
  return `"""\n${docString.content}\n"""`
}

export function formatStepArgument(arg: messages.PickleStepArgument): string {
  return parseStepArgument(arg, {
    dataTable: formatDataTable,
    docString: formatDocString,
  })
}
