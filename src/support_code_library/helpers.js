import util from 'util'
import _ from 'lodash'
import { ParameterType } from 'cucumber-expressions'
import { formatLocation } from '../formatter/helpers'
import HookDefinition from '../models/hook_definition'
import path from 'path'
import StackTrace from 'stacktrace-js'
import StepDefinition from '../models/step_definition'
import validateArguments from './validate_arguments'

export function defineHook(cwd, collection) {
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
      fnName: 'defineHook',
      location: formatLocation({ line, uri })
    })
    const hookDefinition = new HookDefinition({ code, line, options, uri })
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

export function registerHandler(cwd, collection) {
  return (eventName, options, code) => {
    if (typeof options === 'function') {
      code = options
      options = {}
    }
    const { line, uri } = getDefinitionLineAndUri(cwd)
    validateArguments({
      args: { code, eventName, options },
      fnName: 'registerHandler',
      location: formatLocation({ line, uri })
    })
    const listener = _.assign(
      {
        [`handle${eventName}`]: code,
        location: formatLocation({ line, uri })
      },
      options
    )
    collection.push(listener)
  }
}

export function addTransform(parameterTypeRegistry) {
  return util.deprecate(({ captureGroupRegexps, transformer, typeName }) => {
    const parameterType = new ParameterType(
      typeName,
      captureGroupRegexps,
      null,
      transformer,
      true,
      true
    )
    parameterTypeRegistry.defineParameterType(parameterType)
  }, 'addTransform is deprecated and will be removed in a future version. Please use defineParameterType instead.')
}

export function defineParameterType(parameterTypeRegistry) {
  return ({ regexp, transformer, typeName }) => {
    const parameterType = new ParameterType(
      typeName,
      regexp,
      null,
      transformer,
      true,
      true
    )
    parameterTypeRegistry.defineParameterType(parameterType)
  }
}
