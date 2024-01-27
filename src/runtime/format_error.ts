import { TestStepResult } from '@cucumber/messages'
import { format } from 'assertion-error-formatter'
import errorStackParser from 'error-stack-parser'
import { filterStackTrace } from '../filter_stack_trace'

export function formatError(
  error: Error,
  filterStackTraces: boolean
): Pick<TestStepResult, 'message' | 'exception'> {
  let processedStackTrace: string
  try {
    const parsedStack = errorStackParser.parse(error)
    const filteredStack = filterStackTraces
      ? filterStackTrace(parsedStack)
      : parsedStack
    processedStackTrace = filteredStack.map((f) => f.source).join('\n')
  } catch {
    // if we weren't able to parse and process, we'll settle for the original
  }
  const message = format(error, {
    colorFns: {
      errorStack: (stack: string) => {
        return processedStackTrace ? `\n${processedStackTrace}` : stack
      },
    },
  })
  return {
    message,
    exception: {
      type: error.name || 'Error',
      message: typeof error === 'string' ? error : error.message,
      stackTrace: processedStackTrace ?? error.stack,
    },
  }
}
