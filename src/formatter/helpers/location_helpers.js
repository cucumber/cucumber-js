import path from 'path'

export function formatLocation(obj, cwd) {
  let uri = obj.uri
  if (cwd) {
    uri = path.relative(cwd, uri)
  }
  return `${uri}:${obj.line}`
}
