import { dialects } from '@cucumber/gherkin'
import Table from 'cli-table3'

const keywords = [
  'feature',
  'rule',
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
  })
  table.push(header)
  table.push(...rows)
  return table.toString()
}

function capitalizeKeyword(word: string): string {
  return (
    word[0].toUpperCase() +
    word.substring(1).replace(/([A-Z])/g, (char) => ` ${char}`)
  )
}

export function getLanguages(): string {
  const rows = Object.keys(dialects).map((isoCode) => [
    isoCode,
    dialects[isoCode].name,
    dialects[isoCode].native,
  ])
  return getAsTable(['ISO 639-1', 'ENGLISH NAME', 'NATIVE NAME'], rows)
}

export function getKeywords(isoCode: string): string {
  const language = dialects[isoCode]
  const rows = keywords.map((keyword) => {
    const words = language[keyword].map((s) => `"${s}"`).join(', ')
    return [capitalizeKeyword(keyword), words]
  })
  return getAsTable(['ENGLISH KEYWORD', 'NATIVE KEYWORDS'], rows)
}
