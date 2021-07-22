import path from 'path'
import StackTrace from 'stacktrace-js'
import { isFileNameInCucumber } from '../stack_trace_filter'
import { doesHaveValue, valueOrDefault } from '../value_checker'
import { ILineAndUri } from '../types'

export function getDefinitionLineAndUri(cwd: string): ILineAndUri {
  let line: number
  let uri: string
  try {
    const stackframes = StackTrace.getSync()
    const stackframe = stackframes.find((frame) => {
      return !isFileNameInCucumber(frame.getFileName())
    })
    if (stackframe != null) {
      line = stackframe.getLineNumber()
      uri = stackframe.getFileName()
      if (doesHaveValue(uri)) {
        uri = path.relative(cwd, uri)
      }
    }
  } catch (e) {
    console.warn('Warning: unable to get definition line and uri', e)
  }
  return {
    line: valueOrDefault(line, 0),
    uri: valueOrDefault(uri, 'unknown'),
  }
}
