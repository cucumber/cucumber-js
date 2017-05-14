import util from 'util'
import _ from 'lodash'
import {ParameterType} from 'cucumber-expressions'
import {formatLocation} from '../formatter/utils'
import HookDefinition from '../models/hook_definition'
import path from 'path'
import StackTrace from 'stacktrace-js'
import StepDefinition from '../models/step_definition'
import validateArguments from './validate_arguments'

export function defineHookAndAddToCollection(cwd, collection){
  const defineHook = defineHookFactory(cwd)
  return (options, code) => {
    collection.push(defineHook(options, code))
  }
}

export function defineHookFactory(cwd){
  return (options, code) => {
    if (typeof (options) === 'string'){
      options = {tags: options}
    }else if (typeof (options) === 'function'){
      code = options
      options = {}
    }
    const {line, uri} = getDefinitionLineAndUri()
    validateArguments({
      args: {code, options},
      fnName: 'defineHook',
      relativeUri: formatLocation(cwd, {line, uri})
    })
    return new HookDefinition({code, line, options, uri})
  }
}

export function defineStepAndAddToCollection(cwd, collection){
  const defineStep = defineStepFactory(cwd)
  return (pattern, options, code) => {
    const stepDefinition = defineStep(pattern, options, code)
    collection.push(stepDefinition)
  }
}

export function defineStepFactory(cwd){
  return (pattern, options, code) => {
    if (typeof (options) === 'function'){
      code = options
      options = {}
    }
    const {line, uri} = getDefinitionLineAndUri()
    validateArguments({
      args: {code, pattern, options},
      fnName: 'defineStep',
      relativeUri: formatLocation(cwd, {line, uri})
    })
    return new StepDefinition({code, line, options, pattern, uri})
  }
}

export function getDefinitionLineAndUri(){
  const stackframes = StackTrace.getSync()
  const stackframe = stackframes.length > 2 ? stackframes[2] : stackframes[0]
  const line = stackframe.getLineNumber()
  const fileName = stackframe.getFileName()
  const uri = fileName ? fileName.replace(/\//g, path.sep) : 'unknown'
  return {line, uri}
}

export function registerHandler(cwd, collection){
  return (eventName, options, code) => {
    if (typeof (options) === 'function') {
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

export function addTransform(parameterTypeRegistry){
  return util.deprecate(({captureGroupRegexps, transformer, typeName}) => {
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
  return ({regexp, transformer, typeName}) => {
    const parameter = new ParameterType(
      typeName,
      null,
      regexp,
      transformer
    )
    parameterTypeRegistry.defineParameterType(parameter)
  }
}
