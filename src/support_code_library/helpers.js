import _ from 'lodash'
import {Parameter} from 'cucumber-expressions'
import {formatLocation} from '../formatter/utils'
import HookDefinition from '../models/hook_definition'
import path from 'path'
import StackTrace from 'stacktrace-js'
import StepDefinition from '../models/step_definition'
import validateArguments from './validate_arguments'

export function defineHook(cwd, collection) {
  return (options, code) => {
    if (typeof(options) === 'string') {
      options = {tags: options}
    } else if (typeof(options) === 'function') {
      code = options
      options = {}
    }
    const {line, uri} = getDefinitionLineAndUri()
    validateArguments({
      args: {code, options},
      fnName: 'defineHook',
      relativeUri: formatLocation(cwd, {line, uri})
    })
    const hookDefinition = new HookDefinition({code, line, options, uri})
    collection.push(hookDefinition)
  }
}

export function defineStep(cwd, collection) {
  return (pattern, options, code) => {
    if (typeof(options) === 'function') {
      code = options
      options = {}
    }
    const {line, uri} = getDefinitionLineAndUri()
    validateArguments({
      args: {code, pattern, options},
      fnName: 'defineStep',
      relativeUri: formatLocation(cwd, {line, uri})
    })
    const stepDefinition = new StepDefinition({code, line, options, pattern, uri})
    collection.push(stepDefinition)
  }
}

function getDefinitionLineAndUri() {
  const stackframes = StackTrace.getSync()
  const stackframe = stackframes.length > 2 ? stackframes[2] : stackframes[0]
  const line = stackframe.getLineNumber()
  const fileName = stackframe.getFileName()
  const uri = fileName ? fileName.replace(/\//g, path.sep) : 'unknown'
  return {line, uri}
}

export function registerHandler(cwd, collection) {
  return (eventName, options, code) => {
    if (typeof(options) === 'function') {
      code = options
      options = {}
    }
    const {line, uri} = getDefinitionLineAndUri()
    validateArguments({
      args: {code, eventName, options},
      fnName: 'registerHandler',
      relativeUri: formatLocation(cwd, {line, uri})
    })
    const listener = _.assign({
      [`handle${eventName}`]: code,
      relativeUri: formatLocation(cwd, {line, uri})
    }, options)
    collection.push(listener)
  }
}

export function addParameter(parameterRegistry) {
  return ({captureGroupRegexps, transformer, typeName}) => {
    const parameter = new Parameter(
      typeName,
      function() {},
      captureGroupRegexps,
      transformer
    )
    parameterRegistry.addParameter(parameter)
  }
}
