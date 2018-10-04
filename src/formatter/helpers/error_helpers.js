import { format } from 'assertion-error-formatter'

export function formatError(error, colorFns) {
  return format(error, { colorFns })
}
