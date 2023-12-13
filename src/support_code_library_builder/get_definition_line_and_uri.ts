import path from 'node:path'
import errorStackParser, { StackFrame } from 'error-stack-parser'
import { isFileNameInCucumber } from '../filter_stack_trace'
import { doesHaveValue, valueOrDefault } from '../value_checker'
import { ILineAndUri } from '../types'

export function getDefinitionLineAndUri(
  cwd: string,
  isExcluded = isFileNameInCucumber
): ILineAndUri {
  let line: number
  let uri: string
  const stackframes: StackFrame[] = errorStackParser.parse(new Error())
  const stackframe = stackframes.find(
    (frame: StackFrame) =>
      frame.fileName !== __filename && !isExcluded(frame.fileName)
  )
  if (stackframe != null) {
    line = stackframe.getLineNumber()
    uri = stackframe.getFileName()
    if (doesHaveValue(uri)) {
      uri = path.relative(cwd, uri)
    }
  }

  return {
    line: valueOrDefault(line, 0),
    uri: valueOrDefault(uri, 'unknown'),
  }
}
