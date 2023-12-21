import path from 'node:path'
import figures from 'figures'
import { normalizeSummaryDuration } from '../../test/formatter_helpers'

export function normalizeText(text: string): string {
  const normalized = figures(text)
    .replace(/\033\[[0-9;]*m/g, '')
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
