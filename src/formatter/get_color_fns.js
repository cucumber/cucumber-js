import colors from 'colors/safe'
import Status from '../status'

export default function getColorFns(enabled) {
  colors.enabled = enabled
  colors.setTheme({
    [Status.AMBIGUOUS]: 'red',
    [Status.FAILED]: 'red',
    [Status.PASSED]: 'green',
    [Status.PENDING]: 'yellow',
    [Status.SKIPPED]: 'cyan',
    [Status.UNDEFINED]: 'yellow',
    location: 'grey',
    tag: 'cyan'
  })
  return colors
}
