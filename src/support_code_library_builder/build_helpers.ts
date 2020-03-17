import { deprecate } from 'util'
import _ from 'lodash'
import { ParameterType } from 'cucumber-expressions'
import path from 'path'
import StackTrace from 'stacktrace-js'
import { isFileNameInCucumber } from '../stack_trace_filter'
import {
  doesHaveValue,
  doesNotHaveValue,
  valueOrDefault,
} from '../value_checker'
import { ILineAndUri } from '../types'
import { IParameterTypeDefinition } from './types'

export function getDefinitionLineAndUri(cwd: string): ILineAndUri {
  let line: number
  let uri: string
  const stackframes = StackTrace.getSync()
  const stackframe = _.find(stackframes, frame => {
    return !isFileNameInCucumber(frame.getFileName())
  })
  if (doesHaveValue(stackframe)) {
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

export function buildParameterType({
  name,
  typeName,
  regexp,
  transformer,
  useForSnippets,
  preferForRegexpMatch,
}: IParameterTypeDefinition<any>): ParameterType<any> {
  const getTypeName = deprecate(
    () => typeName,
    'Cucumber defineParameterType: Use name instead of typeName'
  )
  if (doesNotHaveValue(name) && doesHaveValue(typeName)) {
    name = getTypeName()
  }
  if (typeof useForSnippets !== 'boolean') useForSnippets = true
  if (typeof preferForRegexpMatch !== 'boolean') preferForRegexpMatch = false
  return new ParameterType(
    name,
    regexp,
    null,
    transformer,
    useForSnippets,
    preferForRegexpMatch
  )
}
