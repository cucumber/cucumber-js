import { format } from 'assertion-error-formatter'
import { IColorFns } from '../get_color_fns'

export function formatError(
  error: string | Error,
  colorFns: IColorFns
): string {
  return format(error, { colorFns })
}
