// Converting windows stack trace to posix
// Removing cwd + '/'
function normalizePaths(str, cwd) {
  return str
    .replace(/\\\\/g, '\\')
    .replace(/\\/g, '/')
    .replace(cwd + '/', '')
}

export function normalizeEventProtocolOutput(str, cwd) {
  return str
    .replace(/"duration":\d*/g, '"duration":0')
    .replace(/"id":"[^"]*"/g, `"id":"abc123"`)
    .replace(
      /"uri":"([^"]*)"/g,
      (match, uri) => `"uri":"${normalizePaths(uri, cwd)}"`
    )
    .replace(/"exception":"([^"]*)"/g, (match, exception) => {
      return `"exception":"${normalizePaths(exception, cwd)}"`
    })
}
