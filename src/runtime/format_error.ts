import { format } from 'assertion-error-formatter'
import errorStackParser from 'error-stack-parser'
import { filterStackTrace } from '../filter_stack_trace'

export function formatError(error: Error, filterStackTraces: boolean): string {
  let filteredStack: string
  if (filterStackTraces) {
    try {
      filteredStack = filterStackTrace(errorStackParser.parse(error))
        .map((f) => f.source)
        .join('\n')
    } catch {
      // if we weren't able to parse and filter, we'll settle for the original
    }
  }
  return format(error, {
    colorFns: {
      errorStack: (stack: string) =>
        filteredStack ? `\n${filteredStack}` : stack,
    },
  })
}
