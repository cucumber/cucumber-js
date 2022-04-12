export function isTruthyString(s: string | undefined): boolean {
  if (s === undefined) {
    return false
  }
  return s.match(/^(false|no|0)$/i) === null
}
