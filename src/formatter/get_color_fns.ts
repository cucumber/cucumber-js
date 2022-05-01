import chalk from 'chalk'
import { ColorInfo, supportsColor } from 'supports-color'
import { TestStepResultStatus } from '@cucumber/messages'
import { Writable } from 'stream'
import { doesNotHaveValue } from '../value_checker'

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

export default function getColorFns(
  stream: Writable,
  enabled?: boolean
): IColorFns {
  const support: ColorInfo = supportsColor(stream, { sniffFlags: false })
  if (doesNotHaveValue(enabled)) {
    enabled = !!support
  }
  if (enabled) {
    const chalkInstance = new chalk.Instance({
      level: support ? support.level : 1,
    })
    return {
      forStatus(status: TestStepResultStatus) {
        return {
          AMBIGUOUS: chalkInstance.red.bind(chalk),
          FAILED: chalkInstance.red.bind(chalk),
          PASSED: chalkInstance.green.bind(chalk),
          PENDING: chalkInstance.yellow.bind(chalk),
          SKIPPED: chalkInstance.cyan.bind(chalk),
          UNDEFINED: chalkInstance.yellow.bind(chalk),
          UNKNOWN: chalkInstance.yellow.bind(chalk),
        }[status]
      },
      location: chalkInstance.gray.bind(chalk),
      tag: chalkInstance.cyan.bind(chalk),
      diffAdded: chalkInstance.green.bind(chalk),
      diffRemoved: chalkInstance.red.bind(chalk),
      errorMessage: chalkInstance.red.bind(chalk),
      errorStack: chalkInstance.grey.bind(chalk),
    }
  } else {
    return {
      forStatus(_status: TestStepResultStatus) {
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
