import util from 'util'
import { ParameterType } from 'cucumber-expressions'
import { formatLocation } from '../formatter/helpers'
import TestCaseHookDefinition from '../models/test_case_hook_definition'
import TestRunHookDefinition from '../models/test_run_hook_definition'
import path from 'path'
import StackTrace from 'stacktrace-js'
import StepDefinition from '../models/step_definition'
import validateArguments from './validate_arguments'

export function defineTestCaseHook(cwd, collection) {
  return (options, code) => {
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
      location: formatLocation({ line, uri })
    })
    const hookDefinition = new TestCaseHookDefinition({
      code,
      line,
      options,
      uri
    })
    collection.push(hookDefinition)
  }
}

export function defineTestRunHook(cwd, collection) {
  return (options, code) => {
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
      location: formatLocation({ line, uri })
    })
    const hookDefinition = new TestRunHookDefinition({
      code,
      line,
      options,
      uri
    })
    collection.push(hookDefinition)
  }
}

export function defineStep(cwd, collection) {
  return (pattern, options, code) => {
    if (typeof options === 'function') {
      code = options
      options = {}
    }
    const { line, uri } = getDefinitionLineAndUri(cwd)
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
    collection.push(stepDefinition)
  }
}

function getDefinitionLineAndUri(cwd) {
  const stackframes = StackTrace.getSync()
  const stackframe = stackframes.length > 2 ? stackframes[2] : stackframes[0]
  const line = stackframe.getLineNumber()
  let uri = stackframe.getFileName()
  if (uri) {
    uri = path.relative(cwd, uri.replace(/\//g, path.sep))
  } else {
    uri = 'unknown'
  }
  return { line, uri }
}

export function addTransform(parameterTypeRegistry) {
  return util.deprecate(({ captureGroupRegexps, transformer, typeName }) => {
    const parameter = new ParameterType(
      typeName,
      null,
      captureGroupRegexps,
      transformer
    )
    parameterTypeRegistry.defineParameterType(parameter)
  }, 'addTransform is deprecated and will be removed in a future version. Please use defineParameterType instead.')
}

export function defineParameterType(parameterTypeRegistry) {
  return ({ regexp, transformer, typeName }) => {
    const parameter = new ParameterType(typeName, null, regexp, transformer)
    parameterTypeRegistry.defineParameterType(parameter)
  }
}
