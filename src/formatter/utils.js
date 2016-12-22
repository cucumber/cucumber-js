import path from 'path'
import {format} from 'assertion-error-formatter'

export function formatLocation(cwd, obj) {
  return path.relative(cwd, obj.uri) + ':' + obj.line
}

export function formatError(error, colorFns) {
  return format(error, {
    colorFns: {
      diffAdded: colorFns.red,
      diffRemoved: colorFns.green,
      errorMessage: colorFns.red,
      errorStack: colorFns.gray
    }
  })
}
