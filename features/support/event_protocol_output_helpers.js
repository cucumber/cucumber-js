import path from 'path'

export function normalizeEventProtocolOutput(str) {
  return str
    .replace(/"duration":\d*/g, '"duration":0')
    .replace(
      /"uri":"([^"]*)"/g,
      (match, uri) => `"uri":"${path.normalize(uri)}"`
    )
}
