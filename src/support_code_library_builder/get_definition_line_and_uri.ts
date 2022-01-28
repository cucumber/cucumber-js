import path from 'path'
import { wrapCallSite } from '@cspotcode/source-map-support'
import stackChain from 'stack-chain'
import { isFileNameInCucumber } from '../stack_trace_filter'
import { doesHaveValue, valueOrDefault } from '../value_checker'
import { ILineAndUri } from '../types'
import CallSite = NodeJS.CallSite

export function getDefinitionLineAndUri(
  cwd: string,
  isExcluded = isFileNameInCucumber
): ILineAndUri {
  let line: number
  let uri: string

  const stackframes: CallSite[] = stackChain.callSite().map(wrapCallSite)
  const stackframe = stackframes.find(
    (frame: CallSite) =>
      frame.getFileName() !== __filename && !isExcluded(frame.getFileName())
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
