import _ from 'lodash'
import Gherkin from 'gherkin'
import Table from 'cli-table3'
import titleCase from 'title-case'

const keywords = [
  'feature',
  'background',
  'scenario',
  'scenarioOutline',
  'examples',
  'given',
  'when',
  'then',
  'and',
  'but',
]

function getAsTable(header, rows) {
  const table = new Table({
    chars: {
      bottom: '',
      'bottom-left': '',
      'bottom-mid': '',
      'bottom-right': '',
      left: '',
      'left-mid': '',
      mid: '',
      'mid-mid': '',
      middle: ' | ',
      right: '',
      'right-mid': '',
      top: '',
      'top-left': '',
      'top-mid': '',
      'top-right': '',
    },
    style: {
      border: [],
      'padding-left': 0,
      'padding-right': 0,
    },
  })
  table.push(header)
  table.push(...rows)
  return table.toString()
}

export function getLanguages() {
  const rows = _.map(Gherkin.DIALECTS, (data, isoCode) => [
    isoCode,
    data.name,
    data.native,
  ])
  return getAsTable(['ISO 639-1', 'ENGLISH NAME', 'NATIVE NAME'], rows)
}

export function getKeywords(isoCode) {
  const language = Gherkin.DIALECTS[isoCode]
  const rows = _.map(keywords, keyword => {
    const words = _.map(language[keyword], s => `"${s}"`).join(', ')
    return [titleCase(keyword), words]
  })
  return getAsTable(['ENGLISH KEYWORD', 'NATIVE KEYWORDS'], rows)
}
