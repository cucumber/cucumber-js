import path from 'path'
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
  try {
    console.log(new Error().stack.split("\n").slice(1).map(
      (line: String) => line.match(/(\/.*):(\d+):\d+/).slice(1,3)
    ))
    const stackframes = stackChain.callSite()
    /*console.log(
      stackframes.map((frame: CallSite) => [
        frame.getLineNumber(),
        frame.getFileName(),
      ])
    )*/
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
  } catch (e) {
    console.warn('Warning: unable to get definition line and uri', e)
  }
  return {
    line: valueOrDefault(line, 0),
    uri: valueOrDefault(uri, 'unknown'),
  }
}
