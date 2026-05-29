import type { TestStepResult } from '@cucumber/messages'
import { format } from 'assertion-error-formatter'
import errorStackParser from 'error-stack-parser'
import { filterStackTrace } from '../filter_stack_trace'

// Guards against runaway or self-referential cause chains.
const MAX_CAUSE_DEPTH = 10

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
  const stackTrace = formatErrorAndCauses(error, filterStackTraces)
  const type = error.constructor.name
  const message = typeof error === 'string' ? error : error.message
  return {
    message: stackTrace,
    exception: {
      type,
      message,
      stackTrace,
    },
  }
}

function formatErrorAndCauses(error: Error, filterStackTraces: boolean): string {
  let output = formatSingleError(error, filterStackTraces)
  const seen = new Set<unknown>([error])
  let cause: unknown = (error as { cause?: unknown }).cause
  for (let depth = 0; cause !== undefined && cause !== null; depth++) {
    if (depth >= MAX_CAUSE_DEPTH) {
      output += '\nCaused by: ... (further causes truncated)'
      break
    }
    if (seen.has(cause)) {
      output += '\nCaused by: ... (circular reference)'
      break
    }
    seen.add(cause)
    if (cause instanceof Error) {
      output += `\nCaused by: ${formatSingleError(cause, filterStackTraces)}`
      cause = (cause as { cause?: unknown }).cause
    } else {
      output += `\nCaused by: ${String(cause)}`
      break
    }
  }
  return output
}

function formatSingleError(error: Error, filterStackTraces: boolean): string {
  let processedStackTrace: string = error.stack
  try {
    const parsedStack = errorStackParser.parse(error)
    const filteredStack = filterStackTraces ? filterStackTrace(parsedStack) : parsedStack
    processedStackTrace = filteredStack.map((f) => f.source).join('\n')
  } catch {
    // if we weren't able to parse and process, we'll settle for the original
  }
  return format(error, {
    colorFns: {
      errorStack: (stack: string) => {
        return processedStackTrace ? `\n${processedStackTrace}` : stack
      },
    },
  })
}
