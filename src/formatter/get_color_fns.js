import colors from 'colors/safe'
import Status from '../status'

export default function getColorFns(enabled) {
  colors.enabled = enabled
  return {
    [Status.AMBIGUOUS]: colors.red,
    bold: colors.bold,
    [Status.FAILED]: colors.red,
    location: colors.grey,
    [Status.PASSED]: colors.green,
    [Status.PENDING]: colors.yellow,
    [Status.SKIPPED]: colors.cyan,
    tag: colors.cyan,
    [Status.UNDEFINED]: colors.yellow
  }
}
