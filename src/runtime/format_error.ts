import type { TestStepResult } from '@cucumber/messages'
import { format } from 'assertion-error-formatter'
import errorStackParser from 'error-stack-parser'
import { filterStackTrace } from '../filter_stack_trace'

export function formatError(
  error: Error | string,
  filterStackTraces: boolean
): Pick<TestStepResult, 'message' | 'exception'> {
  if (typeof error === 'string') {
    const stackTrace = `Error: ${error}`
    return {
      message: stackTrace,
      exception: {
        type: 'Error',
        message: error,
        stackTrace,
      },
    }
  }
  let processedStackTrace: string = error.stack
  try {
    const parsedStack = errorStackParser.parse(error)
    const filteredStack = filterStackTraces ? filterStackTrace(parsedStack) : parsedStack
    processedStackTrace = filteredStack.map((f) => f.source).join('\n')
  } catch {
    // if we weren't able to parse and process, we'll settle for the original
  }
  const stackTrace = format(error, {
    colorFns: {
      errorStack: (stack: string) => {
        return processedStackTrace ? `\n${processedStackTrace}` : stack
      },
    },
  })
  const type = error.constructor.name
  const message = typeof error === 'string' ? error : error.message
  const causeSuffix = formatCause((error as { cause?: unknown }).cause)
  return {
    message: stackTrace + causeSuffix,
    exception: {
      type,
      message,
      stackTrace: stackTrace + causeSuffix,
    },
  }
}

function formatCause(cause: unknown): string {
  if (cause === undefined || cause === null) return ''
  if (cause instanceof Error) {
    return `\nCaused by: ${cause.constructor.name}: ${cause.message}`
  }
  return `\nCaused by: ${String(cause)}`
}
