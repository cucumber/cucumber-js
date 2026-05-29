import type { Writable } from 'node:stream'
import { styleText } from 'node:util'
import type { TestStepResultStatus } from '@cucumber/messages'

type Format = Parameters<typeof styleText>[0]

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

const colorByStatus: Record<TestStepResultStatus, Format> = {
  AMBIGUOUS: 'red',
  FAILED: 'red',
  PASSED: 'green',
  PENDING: 'yellow',
  SKIPPED: 'cyan',
  UNDEFINED: 'yellow',
  UNKNOWN: 'yellow',
}

export default function getColorFns(stream: Writable): IColorFns {
  // styleText validates the stream itself, honoring FORCE_COLOR / NO_COLOR / TTY detection
  const fn =
    (format: Format): IColorFn =>
    (text) =>
      styleText(format, text, { stream })

  return {
    forStatus: (status: TestStepResultStatus) => fn(colorByStatus[status]),
    location: fn('gray'),
    tag: fn('cyan'),
    diffAdded: fn('green'),
    diffRemoved: fn('red'),
    errorMessage: fn('red'),
    errorStack: fn('grey'),
  }
}
