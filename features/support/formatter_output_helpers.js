// Converts windows uri to posix
//   features\\a.feature
//     becomes
//   features/a.feature
function normalizeUri(uri) {
  return uri.replace(/\\\\/g, '/')
}

// Converting windows stack trace to posix
//    C:\\project\\path\\features\\support/code.js
//      becomes
//    features/support/code.js
function normalizeException(exception, cwd) {
  return exception
    .replace(/\\\\/g, '\\')
    .replace(cwd, '')
    .replace(/\\/g, '/')
    .replace('/features', 'features')
}

function normalizeObject(obj, cwd) {
  if (obj.actionLocation) {
    obj.actionLocation.uri = normalizeUri(obj.actionLocation.uri, cwd)
  }
  if (obj.sourceLocation) {
    obj.sourceLocation.uri = normalizeUri(obj.sourceLocation.uri, cwd)
  }
  if (obj.result) {
    if (obj.result.duration) {
      obj.result.duration = 0
    }
    if (obj.result.exception) {
      obj.result.exception = normalizeException(obj.result.exception, cwd)
    }
  }
}

export function parseEventProtocolOutput(str) {
  return str
    .split('\n')
    .filter(x => x)
    .map(x => JSON.parse(x))
}

export function normalizeEventProtocolOutput(str, cwd) {
  const events = parseEventProtocolOutput(str)
  events.forEach(e => {
    normalizeObject(e)
    if (e.steps) {
      e.steps.forEach(e => {
        normalizeObject(e)
      })
    }
  })
  return events
}

export function normalizeJsonOutput(str, cwd) {
  const json = JSON.parse(str || '[]')
  json.forEach(obj => {
    normalizeObject(obj.testCase, cwd)
    obj.testSteps.forEach(s => {
      normalizeObject(s, cwd)
    })
  })
  return json
}
