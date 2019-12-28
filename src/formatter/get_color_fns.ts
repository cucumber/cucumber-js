import _ from 'lodash'
import colors from 'colors/safe'
import Status from '../status'

colors.enable()

export type IColorFn = (text: string) => string

export interface IColorFns {
  forStatus(status: Status): IColorFn
  location: IColorFn
  tag: IColorFn
}

export default function getColorFns(enabled: boolean): IColorFns {
  if (enabled) {
    return {
      forStatus(status: Status) {
        return {
          [Status.AMBIGUOUS]: colors.red.bind(colors),
          [Status.FAILED]: colors.red.bind(colors),
          [Status.PASSED]: colors.green.bind(colors),
          [Status.PENDING]: colors.yellow.bind(colors),
          [Status.SKIPPED]: colors.cyan.bind(colors),
          [Status.UNDEFINED]: colors.yellow.bind(colors),
        }[status]
      },
      location: colors.gray.bind(colors),
      tag: colors.cyan.bind(colors),
    }
  } else {
    return {
      forStatus(status: Status) {
        return _.identity
      },
      location: _.identity,
      tag: _.identity,
    }
  }
}
