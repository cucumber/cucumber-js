import path from 'path'

import { ILineAndUri } from '../../types'
import { doesHaveValue } from '../../value_checker'

export function formatLocation(obj: ILineAndUri, cwd?: string): string {
  let uri = obj.uri
  if (doesHaveValue(cwd)) {
    uri = path.relative(cwd, uri)
  }
  return `${uri}:${obj.line.toString()}`
}
