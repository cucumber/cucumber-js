import _ from 'lodash'
import colors from 'colors/safe'
import Status from '../status'
import { messages } from 'cucumber-messages'

colors.enable()

export type IColorFn = (text: string) => string

export interface IColorFns {
  forStatus(status: messages.TestResult.Status): IColorFn
  location: IColorFn
  tag: IColorFn

  // For assertion-error-formatter
  diffAdded: IColorFn
  diffRemoved: IColorFn
  errorMessage: IColorFn
  errorStack: IColorFn
}

export default function getColorFns(enabled: boolean): IColorFns {
  if (enabled) {
    return {
      forStatus(status: messages.TestResult.Status) {
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
      diffAdded: colors.green.bind(colors),
      diffRemoved: colors.red.bind(colors),
      errorMessage: colors.red.bind(colors),
      errorStack: colors.gray.bind(colors),
    }
  } else {
    return {
      forStatus(status: messages.TestResult.Status) {
        return _.identity
      },
      location: _.identity,
      tag: _.identity,
      diffAdded: _.identity,
      diffRemoved: _.identity,
      errorMessage: _.identity,
      errorStack: _.identity,
    }
  }
}
