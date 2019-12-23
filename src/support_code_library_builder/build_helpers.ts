import { deprecate } from 'util'
import _ from 'lodash'
import { ParameterType } from 'cucumber-expressions'
import path from 'path'
import StackTrace from 'stacktrace-js'
import { isFileNameInCucumber } from '../stack_trace_filter'

export function getDefinitionLineAndUri(cwd) {
  let line = 'unknown'
  let uri = 'unknown'
  const stackframes = StackTrace.getSync()
  const stackframe = _.find(stackframes, frame => {
    return !isFileNameInCucumber(frame.getFileName())
  })
  if (stackframe) {
    line = stackframe.getLineNumber()
    uri = stackframe.getFileName()
    if (uri) {
      uri = path.relative(cwd, uri)
    }
  }
  return { line, uri }
}

export function buildParameterType({
  name,
  typeName,
  regexp,
  transformer,
  useForSnippets,
  preferForRegexpMatch,
}) {
  const getTypeName = deprecate(
    () => typeName,
    'Cucumber defineParameterType: Use name instead of typeName'
  )
  const _name = name || getTypeName()
  if (typeof useForSnippets !== 'boolean') useForSnippets = true
  if (typeof preferForRegexpMatch !== 'boolean') preferForRegexpMatch = false
  return new ParameterType(
    _name,
    regexp,
    null,
    transformer,
    useForSnippets,
    preferForRegexpMatch
  )
}
