import chalk from 'chalk'
import { TestStepResultStatus } from '@cucumber/messages'

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
          AMBIGUOUS: chalk.red.bind(chalk),
          FAILED: chalk.red.bind(chalk),
          PASSED: chalk.green.bind(chalk),
          PENDING: chalk.yellow.bind(chalk),
          SKIPPED: chalk.cyan.bind(chalk),
          UNDEFINED: chalk.yellow.bind(chalk),
          UNKNOWN: chalk.yellow.bind(chalk),
        }[status]
      },
      location: chalk.gray.bind(chalk),
      tag: chalk.cyan.bind(chalk),
      diffAdded: chalk.green.bind(chalk),
      diffRemoved: chalk.red.bind(chalk),
      errorMessage: chalk.red.bind(chalk),
      errorStack: chalk.grey.bind(chalk),
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
