import _ from 'lodash'
import { formatLocation } from './location_helpers'
import { getStepMessage } from './step_result_helpers'
import indentString from 'indent-string'
import Status from '../../status'
import figures from 'figures'
import Table from 'cli-table'
import KeywordType, { getStepKeywordType } from './keyword_type'
import { buildStepArgumentIterator } from '../../step_arguments'
import { getStepLineToKeywordMap } from './gherkin_document_parser'
import { getStepLineToPickledStepMap, getStepKeyword } from './pickle_parser'

const CHARACTERS = {
  [Status.AMBIGUOUS]: figures.cross,
  [Status.FAILED]: figures.cross,
  [Status.PASSED]: figures.tick,
  [Status.PENDING]: '?',
  [Status.SKIPPED]: '-',
  [Status.UNDEFINED]: '?',
}

const IS_ISSUE = {
  [Status.AMBIGUOUS]: true,
  [Status.FAILED]: true,
  [Status.PASSED]: false,
  [Status.PENDING]: true,
  [Status.SKIPPED]: false,
  [Status.UNDEFINED]: true,
}

function formatDataTable(arg) {
  const rows = arg.rows.map(row =>
    row.cells.map(cell =>
      cell.value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n')
    )
  )
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
  table.push(...rows)
  return table.toString()
}

function formatDocString(arg) {
  return `"""\n${arg.content}\n"""`
}

function formatStep({
  colorFns,
  isBeforeHook,
  keyword,
  keywordType,
  pickleStep,
  snippetBuilder,
  testStep,
}) {
  const { status } = testStep.result
  const colorFn = colorFns[status]

  let identifier
  if (testStep.sourceLocation) {
    identifier = keyword + (pickleStep.text || '')
  } else {
    identifier = isBeforeHook ? 'Before' : 'After'
  }

  let text = colorFn(`${CHARACTERS[status]} ${identifier}`)

  const { actionLocation } = testStep
  if (actionLocation) {
    text += ` # ${colorFns.location(formatLocation(actionLocation))}`
  }
  text += '\n'

  if (pickleStep) {
    let str
    const iterator = buildStepArgumentIterator({
      dataTable: arg => (str = formatDataTable(arg)),
      docString: arg => (str = formatDocString(arg)),
    })
    _.each(pickleStep.arguments, iterator)
    if (str) {
      text += indentString(`${colorFn(str)}\n`, 4)
    }
  }

  if (testStep.attachments) {
    testStep.attachments.forEach(({ media, data }) => {
      const message = media.type === 'text/plain' ? `: ${data}` : ''
      text += indentString(`Attachment (${media.type})${message}\n`, 4)
    })
  }

  const message = getStepMessage({
    colorFns,
    keywordType,
    pickleStep,
    snippetBuilder,
    testStep,
  })
  if (message) {
    text += `${indentString(message, 4)}\n`
  }
  return text
}

export function isIssue(status) {
  return IS_ISSUE[status]
}

export function formatIssue({
  colorFns,
  gherkinDocument,
  number,
  pickle,
  snippetBuilder,
  testCase,
}) {
  const prefix = `${number}) `
  let text = prefix
  const scenarioLocation = formatLocation(testCase.sourceLocation)
  text += `Scenario: ${pickle.name} # ${colorFns.location(scenarioLocation)}\n`
  const stepLineToKeywordMap = getStepLineToKeywordMap(gherkinDocument)
  const stepLineToPickledStepMap = getStepLineToPickledStepMap(pickle)
  let isBeforeHook = true
  let previousKeywordType = KeywordType.PRECONDITION
  _.each(testCase.steps, testStep => {
    isBeforeHook = isBeforeHook && !testStep.sourceLocation
    let keyword, keywordType, pickleStep
    if (testStep.sourceLocation) {
      pickleStep = stepLineToPickledStepMap[testStep.sourceLocation.line]
      keyword = getStepKeyword({ pickleStep, stepLineToKeywordMap })
      keywordType = getStepKeywordType({
        keyword,
        language: gherkinDocument.feature.language,
        previousKeywordType,
      })
    }
    const formattedStep = formatStep({
      colorFns,
      isBeforeHook,
      keyword,
      keywordType,
      pickleStep,
      snippetBuilder,
      testStep,
    })
    text += indentString(formattedStep, prefix.length)
    previousKeywordType = keywordType
  })
  return `${text}\n`
}
