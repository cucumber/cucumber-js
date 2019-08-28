import _ from 'lodash'
import { formatLocation } from './location_helpers'
import { getStepMessage } from './step_result_helpers'
import indentString from 'indent-string'
import Status from '../../status'
import figures from 'figures'
import Table from 'cli-table3'
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
  testStepResult,
  testStepAttachments,
}) {
  const { status } = testStepResult
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

  if (testStepAttachments) {
    testStepAttachments.forEach(({ media, data }) => {
      const message = media.type === 'text/plain' ? `: ${data}` : ''
      text += indentString(`Attachment (${media.type})${message}\n`, 4)
    })
  }

  const message = getStepMessage({
    colorFns,
    keywordType,
    pickleStep,
    snippetBuilder,
    testStepResult,
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
  testCaseAttempt,
}) {
  const prefix = `${number}) `
  let text = prefix
  const scenarioLocation = formatLocation(
    testCaseAttempt.testCase.sourceLocation
  )
  text += `Scenario: ${pickle.name} `
  text += getAttemptText(
    testCaseAttempt.attemptNumber,
    testCaseAttempt.result.retried
  )
  text += `# ${colorFns.location(scenarioLocation)}\n`
  const stepLineToKeywordMap = getStepLineToKeywordMap(gherkinDocument)
  const stepLineToPickledStepMap = getStepLineToPickledStepMap(pickle)
  let isBeforeHook = true
  let previousKeywordType = KeywordType.PRECONDITION
  _.each(testCaseAttempt.stepResults, (testStepResult, index) => {
    const testStep = testCaseAttempt.testCase.steps[index]
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
      testStepResult,
      testStepAttachments: testCaseAttempt.stepAttachments[index],
    })
    text += indentString(formattedStep, prefix.length)
    previousKeywordType = keywordType
  })
  return `${text}\n`
}

function getAttemptText(attemptNumber, retried) {
  if (retried) {
    return `(attempt ${attemptNumber}, retried) `
  }
  if (attemptNumber > 1) {
    return `(attempt ${attemptNumber}) `
  }
  return ''
}
