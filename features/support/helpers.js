import path from 'path'
import figures from 'figures'

export function normalizeText(text) {
  return figures(text)
    .replace(/\033\[[0-9;]*m/g, '')
    .replace(/\r\n|\r/g, '\n')
    .trim()
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\d+m\d{2}\.\d{3}s/, '<duration-stat>')
    .replace(/\d+(.\d+)?ms/g, '<d>ms')
    .replace(/\//g, path.sep)
    .replace(/ +/g, ' ')
    .split('\n')
    .map(line => line.trim())
    .join('\n')
}
