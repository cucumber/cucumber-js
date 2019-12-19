import { deprecate } from 'util'
import _ from 'lodash'
import { formatLocation } from '../formatter/helpers'
import {
  ParameterType,
  CucumberExpression,
  RegularExpression,
} from 'cucumber-expressions'
import path from 'path'
import StackTrace from 'stacktrace-js'
import { isFileNameInCucumber } from '../stack_trace_filter'
import StepDefinition from '../models/step_definition'
import TestCaseHookDefinition from '../models/test_case_hook_definition'
import TestRunHookDefinition from '../models/test_run_hook_definition'
import validateArguments from './validate_arguments'

export interface IStepDefinitionConfig {
  code: any
  line: string
  options: any
  pattern: string | RegExp
  uri: string
}

export function buildTestCaseHookDefinition({ options, code, cwd, id }) {
  if (typeof options === 'string') {
    options = { tags: options }
  } else if (typeof options === 'function') {
    code = options
    options = {}
  }
  const { line, uri } = getDefinitionLineAndUri(cwd)
  validateArguments({
    args: { code, options },
    fnName: 'defineTestCaseHook',
    location: formatLocation({ line, uri }),
  })
  return new TestCaseHookDefinition({
    code,
    id,
    line,
    options,
    uri,
  })
}

export function buildTestRunHookDefinition({ options, code, cwd, id }) {
  if (typeof options === 'string') {
    options = { tags: options }
  } else if (typeof options === 'function') {
    code = options
    options = {}
  }
  const { line, uri } = getDefinitionLineAndUri(cwd)
  validateArguments({
    args: { code, options },
    fnName: 'defineTestRunHook',
    location: formatLocation({ line, uri }),
  })
  return new TestRunHookDefinition({
    code,
    id,
    line,
    options,
    uri,
  })
}

export function buildStepDefinitionConfig({ pattern, options, code, cwd }) {
  if (typeof options === 'function') {
    code = options
    options = {}
  }
  const { line, uri } = getDefinitionLineAndUri(cwd)
  validateArguments({
    args: { code, pattern, options },
    fnName: 'defineStep',
    location: formatLocation({ line, uri }),
  })
  return {
    code,
    line,
    options,
    pattern,
    uri,
  }
}

export function buildStepDefinitionFromConfig({
  config,
  id,
  parameterTypeRegistry,
}) {
  const { code, line, options, uri, pattern } = config
  const Expression =
    typeof pattern === 'string' ? CucumberExpression : RegularExpression

  const expression = new Expression(pattern, parameterTypeRegistry)
  return new StepDefinition({
    code,
    id,
    line,
    options,
    uri,
    pattern,
    expression,
  })
}

function getDefinitionLineAndUri(cwd) {
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
