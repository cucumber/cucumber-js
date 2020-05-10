import _ from 'lodash'
import { dialects } from '@cucumber/gherkin'
import Table, { HorizontalTable } from 'cli-table3'
import { capitalCase } from 'capital-case'

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
] as const

function getAsTable(header: string[], rows: string[][]): string {
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
  }) as HorizontalTable
  table.push(header)
  table.push(...rows)
  return table.toString()
}

export function getLanguages(): string {
  const rows = _.map(dialects, (data, isoCode) => [
    isoCode,
    data.name,
    data.native,
  ])
  return getAsTable(['ISO 639-1', 'ENGLISH NAME', 'NATIVE NAME'], rows)
}

export function getKeywords(isoCode: string): string {
  const language = dialects[isoCode]
  const rows = _.map(keywords, keyword => {
    const words = _.map(language[keyword], s => `"${s}"`).join(', ')
    return [capitalCase(keyword), words]
  })
  return getAsTable(['ENGLISH KEYWORD', 'NATIVE KEYWORDS'], rows)
}
