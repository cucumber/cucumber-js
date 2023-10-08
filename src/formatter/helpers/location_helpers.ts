import path from 'node:path'
import { doesHaveValue } from '../../value_checker'
import { ILineAndUri } from '../../types'

export function formatLocation(obj: ILineAndUri, cwd?: string): string {
  let uri = obj.uri
  if (doesHaveValue(cwd)) {
    uri = path.relative(cwd, uri)
  }
  return `${uri}:${obj.line.toString()}`
}
