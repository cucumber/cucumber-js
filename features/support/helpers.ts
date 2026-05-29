import path from 'node:path'
import { replaceSymbols } from 'figures'
import { normalizeSummaryDuration } from '../../test/formatter_helpers'

export function normalizeText(text: string): string {
  const normalized = replaceSymbols(text)
    .replace(/\r\n|\r/g, '\n')
    .trim()
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\d+(.\d+)?ms/g, '<d>ms')
    .replace(/\//g, path.sep)
    .replace(/ +/g, ' ')
    .replace(/─+/gu, '─')
    .split('\n')
    .map((line) => line.trim())
    .join('\n')

  return normalizeSummaryDuration(normalized)
}
