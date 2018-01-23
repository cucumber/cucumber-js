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

export function defineTestCaseHook(builder, collectionName) {
  return (options, code) => {
    if (typeof options === 'string') {
      options = { tags: options }
    } else if (typeof options === 'function') {
      code = options
      options = {}
    }
    const { line, uri } = getDefinitionLineAndUri(builder.cwd)
    validateArguments({
      args: { code, options },
      fnName: 'defineTestCaseHook',
      location: formatLocation({ line, uri })
    })
    const hookDefinition = new TestCaseHookDefinition({
      code,
      line,
      options,
      uri
    })
    builder.options[collectionName].push(hookDefinition)
  }
}

export function defineTestRunHook(builder, collectionName) {
  return (options, code) => {
    if (typeof options === 'string') {
      options = { tags: options }
    } else if (typeof options === 'function') {
      code = options
      options = {}
    }
    const { line, uri } = getDefinitionLineAndUri(builder.cwd)
    validateArguments({
      args: { code, options },
      fnName: 'defineTestRunHook',
      location: formatLocation({ line, uri })
    })
    const hookDefinition = new TestRunHookDefinition({
      code,
      line,
      options,
      uri
    })
    builder.options[collectionName].push(hookDefinition)
  }
}

export function defineStep(builder) {
  return (pattern, options, code) => {
    if (typeof options === 'function') {
      code = options
      options = {}
    }
    const { line, uri } = getDefinitionLineAndUri(builder.cwd)
    validateArguments({
      args: { code, pattern, options },
      fnName: 'defineStep',
      location: formatLocation({ line, uri })
    })
    const stepDefinition = new StepDefinition({
      code,
      line,
      options,
      pattern,
      uri
    })
    builder.options.stepDefinitions.push(stepDefinition)
  }
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

export function defineParameterType(builder) {
  return ({
    name,
    typeName,
    regexp,
    transformer,
    useForSnippets,
    preferForRegexpMatch
  }) => {
    const getTypeName = deprecate(
      () => typeName,
      'Cucumber defineParameterType: Use name instead of typeName'
    )
    const _name = name || getTypeName()
    if (typeof useForSnippets !== 'boolean') useForSnippets = true
    if (typeof preferForRegexpMatch !== 'boolean') preferForRegexpMatch = false
    const parameterType = new ParameterType(
      _name,
      regexp,
      null,
      transformer,
      useForSnippets,
      preferForRegexpMatch
    )
    builder.options.parameterTypeRegistry.defineParameterType(parameterType)
  }
}
