import { format } from 'assertion-error-formatter'

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
