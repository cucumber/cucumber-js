import _ from 'lodash'

// Converting windows stack trace to posix and removing cwd
//    C:\\project\\path\\features\\support/code.js
//      becomes
//    features/support/code.js
function normalizeExceptionAndUri(exception, cwd) {
  return exception
    .replace(cwd, '')
    .replace(/\\/g, '/')
    .replace('/features', 'features')
}

function normalizeProtobufObject(obj, cwd) {
  if (obj.uri) {
    obj.uri = normalizeExceptionAndUri(obj.uri, cwd)
  }
  if (obj.testResult) {
    if (obj.testResult.duration) {
      obj.testResult.duration.nanos = 0
    }
    if (obj.testResult.message) {
      obj.testResult.message = normalizeExceptionAndUri(
        obj.testResult.message,
        cwd
      )
    }
  }
}

export function normalizeProtobufOutput(envelopeObjects, cwd) {
  envelopeObjects.forEach(e => {
    for (const key in e) {
      normalizeProtobufObject(e[key], cwd)
    }
  })
  return envelopeObjects
}

export function normalizeJsonOutput(str, cwd) {
  const json = JSON.parse(str || '[]')
  _.each(json, feature => {
    if (feature.uri) {
      feature.uri = normalizeExceptionAndUri(feature.uri, cwd)
    }
    _.each(feature.elements, element => {
      _.each(element.steps, step => {
        if (step.match && step.match.location) {
          step.match.location = normalizeExceptionAndUri(
            step.match.location,
            cwd
          )
        }
        if (step.result) {
          if (step.result.duration) {
            step.result.duration = 0
          }
          if (step.result.error_message) {
            step.result.error_message = normalizeExceptionAndUri(
              step.result.error_message,
              cwd
            )
          }
        }
      })
    })
  })
  return json
}
