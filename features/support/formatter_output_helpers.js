// Converts windows uri to posix
//   features\\a.feature
//     becomes
//   features/a.feature
function normalizeUri(uri) {
  return uri.replace(/\\/g, '/')
}

// Converting windows stack trace to posix
//    C:\\project\\path\\features\\support/code.js
//      becomes
//    features/support/code.js
function normalizeException(exception, cwd) {
  const out = exception
    .replace(cwd, '')
    .replace(/\\/g, '/')
    .replace('/features', 'features')
  console.log(exception, cwd, 'normalized to', out)
  return out
}

function normalizeObject(obj, cwd) {
  if (obj.uri) {
    obj.uri = normalizeUri(obj.uri, cwd)
  }
  const uriParentKeys = ['actionLocation', 'media', 'source', 'sourceLocation']
  uriParentKeys.forEach(key => {
    if (obj[key] && obj[key].uri) {
      obj[key].uri = normalizeUri(obj[key].uri, cwd)
    }
  })
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
    normalizeObject(e, cwd)
    if (e.steps) {
      e.steps.forEach(s => {
        normalizeObject(s, cwd)
      })
    }
    if (e.testCase) {
      normalizeObject(e.testCase, cwd)
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
