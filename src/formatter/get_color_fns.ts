import _ from 'lodash'
import colors from 'colors/safe'
import { TestStepResultStatus } from '@cucumber/messages'

colors.enable()

export type IColorFn = (text: string) => string

export interface IColorFns {
  forStatus: (status: TestStepResultStatus) => IColorFn
  location: IColorFn
  tag: IColorFn
}

export default function getColorFns(enabled: boolean): IColorFns {
  if (enabled) {
    return {
      forStatus(status: TestStepResultStatus) {
        return {
          AMBIGUOUS: colors.red.bind(colors),
          FAILED: colors.red.bind(colors),
          PASSED: colors.green.bind(colors),
          PENDING: colors.yellow.bind(colors),
          SKIPPED: colors.cyan.bind(colors),
          UNDEFINED: colors.yellow.bind(colors),
          UNKNOWN: colors.yellow.bind(colors),
        }[status]
      },
      location: colors.gray.bind(colors),
      tag: colors.cyan.bind(colors),
    }
  } else {
    return {
      forStatus(status: TestStepResultStatus) {
        return _.identity
      },
      location: _.identity,
      tag: _.identity,
    }
  }
}
