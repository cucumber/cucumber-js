import Table from 'cli-table3'
import { buildStepArgumentIterator } from '../../step_arguments'

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

export function formatStepArguments(args) {
  const iterator = buildStepArgumentIterator({
    dataTable: arg => formatDataTable(arg),
    docString: arg => formatDocString(arg),
  })
  return args.map(iterator).join('\n')
}
