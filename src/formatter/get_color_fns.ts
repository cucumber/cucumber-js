import { TestStepResultStatus } from '@cucumber/messages'
import colors from 'colors/safe'

colors.enable()

export type IColorFn = (text: string) => string

export interface IColorFns {
  forStatus: (status: TestStepResultStatus) => IColorFn
  location: IColorFn
  tag: IColorFn
  diffAdded: IColorFn
  diffRemoved: IColorFn
  errorMessage: IColorFn
  errorStack: IColorFn
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
      diffAdded: colors.green.bind(colors),
      diffRemoved: colors.red.bind(colors),
      errorMessage: colors.red.bind(colors),
      errorStack: colors.grey.bind(colors),
    }
  } else {
    return {
      forStatus(status: TestStepResultStatus) {
        return (x) => x
      },
      location: (x) => x,
      tag: (x) => x,
      diffAdded: (x) => x,
      diffRemoved: (x) => x,
      errorMessage: (x) => x,
      errorStack: (x) => x,
    }
  }
}
