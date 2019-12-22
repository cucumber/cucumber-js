import path from 'path'
import { doesHaveValue } from '../../value_checker'

export interface ILineAndUri {
  line: number | string
  uri: string
}

export function formatLocation(obj: ILineAndUri, cwd?: string): string {
  let uri = obj.uri
  if (doesHaveValue(cwd)) {
    uri = path.relative(cwd, uri)
  }
  return `${uri}:${obj.line}`
}
