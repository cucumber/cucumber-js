import { Writable } from 'node:stream'
import pc from 'picocolors'
import { ColorInfo, supportsColor } from 'supports-color'
import { TestStepResultStatus } from '@cucumber/messages'
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
  env: NodeJS.ProcessEnv,
  enabled?: boolean
): IColorFns {
  const support: ColorInfo = detectSupport(stream, env, enabled)
  const colors = pc.createColors(!!support)
  return {
    forStatus(status: TestStepResultStatus) {
      return {
        AMBIGUOUS: colors.red,
        FAILED: colors.red,
        PASSED: colors.green,
        PENDING: colors.yellow,
        SKIPPED: colors.cyan,
        UNDEFINED: colors.yellow,
        UNKNOWN: colors.yellow,
      }[status]
    },
    location: colors.gray,
    tag: colors.cyan,
    diffAdded: colors.green,
    diffRemoved: colors.red,
    errorMessage: colors.red,
    errorStack: colors.gray,
  }
}

function detectSupport(
  stream: Writable,
  env: NodeJS.ProcessEnv,
  enabled?: boolean
): ColorInfo {
  const support: ColorInfo = supportsColor(stream)
  // if we find FORCE_COLOR, we can let the supports-color library handle that
  if ('FORCE_COLOR' in env || doesNotHaveValue(enabled)) {
    return support
  }
  return enabled ? support || { level: 1 } : false
}
