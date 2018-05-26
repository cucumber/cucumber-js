import { deprecate } from 'util'
import _ from 'lodash'
import { formatLocation } from '../formatter/helpers'
import { ParameterType } from 'cucumber-expressions'
import path from 'path'
import StackTrace from 'stacktrace-js'
import StepDefinition from '../models/step_definition'
import TestCaseHookDefinition from '../models/test_case_hook_definition'
import TestRunHookDefinition from '../models/test_run_hook_definition'
import validateArguments from './validate_arguments'

export function buildTestCaseHookDefinition({ options, code, cwd }) {
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
    line,
    options,
    uri,
  })
}

export function buildTestRunHookDefinition({ options, code, cwd }) {
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
    line,
    options,
    uri,
  })
}

export function buildStepDefinition({ pattern, options, code, phase, cwd }) {
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
  return new StepDefinition({
    phase,
    code,
    line,
    options,
    pattern,
    uri,
  })
}

const projectPath = path.join(__dirname, '..', '..')
const projectSrcPath = path.join(projectPath, 'src')
const projectLibPath = path.join(projectPath, 'lib')

function getDefinitionLineAndUri(cwd) {
  let line = 'unknown'
  let uri = 'unknown'
  const stackframes = StackTrace.getSync()
  const stackframe = _.find(stackframes, frame => {
    const filename = frame.getFileName()
    return (
      !_.includes(filename, projectSrcPath) &&
      !_.includes(filename, projectLibPath)
    )
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
