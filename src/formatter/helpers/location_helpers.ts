import path from 'path'

// TODO define obj structure
export function formatLocation(obj: any, cwd?: string) {
  let uri = obj.uri
  if (cwd) {
    uri = path.relative(cwd, uri)
  }
  return `${uri}:${obj.line}`
}
