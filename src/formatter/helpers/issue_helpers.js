import _ from 'lodash'
import {formatLocation} from './location_helpers'
import {getStepResultMessage} from './step_result_helpers'
import indentString from 'indent-string'
import Status from '../../status'
import figures from 'figures'
import Table from 'cli-table'

const CHARACTERS = {
  [Status.AMBIGUOUS]: figures.cross,
  [Status.FAILED]: figures.cross,
  [Status.PASSED]: figures.tick,
  [Status.PENDING]: '?',
  [Status.SKIPPED]: '-',
  [Status.UNDEFINED]: '?'
}

function formatDataTable(dataTable) {
  const rows = dataTable.raw().map((row) => {
    return row.map((cell) => {
      return cell.replace(/\\/g, '\\\\').replace(/\n/g, '\\n')
    })
  })
  const table = new Table({
    chars: {
      'bottom': '', 'bottom-left': '', 'bottom-mid': '', 'bottom-right': '',
      'left': '|', 'left-mid': '',
      'mid': '', 'mid-mid': '', 'middle': '|',
      'right': '|', 'right-mid': '',
      'top': '' , 'top-left': '', 'top-mid': '', 'top-right': ''
    },
    style: {
      border: [], 'padding-left': 1, 'padding-right': 1
    }
  })
  table.push.apply(table, rows)
  return table.toString()
}

function formatDocString(docString) {
  return '"""\n' + docString.content + '\n"""'
}

function formatStepResult({colorFns, cwd, stepResult}) {
  const {status, step} = stepResult
  const colorFn = colorFns[status]

  const symbol = CHARACTERS[stepResult.status]
  const identifier = colorFn(symbol + ' ' + step.keyword + (step.name || ''))
  let text = identifier

  const {stepDefinition} = stepResult
  if (stepDefinition) {
    const stepDefinitionLocation = formatLocation(cwd, stepDefinition)
    const stepDefinitionLine = ' # ' + colorFns.location(stepDefinitionLocation)
    text += stepDefinitionLine
  }
  text += '\n'

  step.arguments.forEach((arg) => {
    let str
    if (arg instanceof DataTable) {
      str = formatDataTable(arg)
    } else if (arg instanceof DocString) {
      str = formatDocString(arg)
    } else {
      throw new Error('Unknown argument type: ' + arg)
    }
    text += indentString(colorFn(str) + '\n', 4)
  })
  return text
}

export function formatIssue({colorFns, cwd, number, snippetBuilder, scenarioResult}) {
  const prefix = number + ') '
  const {scenario, stepResults} = scenarioResult
  let text = prefix
  const scenarioLocation = formatLocation(cwd, scenario)
  text += 'Scenario: ' + scenario.name + ' # ' + colorFns.location(scenarioLocation) + "\n"
  _.each(stepResults, (stepResult) => {
    const identifier = formatStepResult({colorFns, cwd, stepResult})
    text += indentString(identifier, prefix.length)
    const message = getStepResultMessage({colorFns, cwd, snippetBuilder, stepResult})
    if (message) {
      text += indentString(message, prefix.length + 4) + '\n'
    }
  })
  return text + '\n'
}
