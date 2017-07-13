import util from 'util'
import _ from 'lodash'
import { ParameterType } from 'cucumber-expressions'
import { formatLocation } from '../formatter/helpers'
import ScenarioHookDefinition from '../models/scenario_hook_definition'
import FeaturesHookDefinition from '../models/features_hook_definition'
import path from 'path'
import StackTrace from 'stacktrace-js'
import StepDefinition from '../models/step_definition'
import validateArguments from './validate_arguments'

export function defineScenarioHook(cwd, collection) {
  return (options, code) => {
    if (typeof options === 'string') {
      options = { tags: options }
    } else if (typeof options === 'function') {
      code = options
      options = {}
    }
    const { line, uri } = getDefinitionLineAndUri()
    validateArguments({
      args: { code, options },
      fnName: 'defineScenarioHook',
      relativeUri: formatLocation(cwd, { line, uri })
    })
    const hookDefinition = new ScenarioHookDefinition({
      code,
      line,
      options,
      uri
    })
    collection.push(hookDefinition)
  }
}

export function defineFeaturesHook(cwd, collection) {
  return (options, code) => {
    if (typeof options === 'string') {
      options = { tags: options }
    } else if (typeof options === 'function') {
      code = options
      options = {}
    }
    const { line, uri } = getDefinitionLineAndUri()
    validateArguments({
      args: { code, options },
      fnName: 'defineFeaturesHook',
      relativeUri: formatLocation(cwd, { line, uri })
    })
    const hookDefinition = new FeaturesHookDefinition({
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
    const { line, uri } = getDefinitionLineAndUri()
    validateArguments({
      args: { code, pattern, options },
      fnName: 'defineStep',
      relativeUri: formatLocation(cwd, { line, uri })
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

function getDefinitionLineAndUri() {
  const stackframes = StackTrace.getSync()
  const stackframe = stackframes.length > 2 ? stackframes[2] : stackframes[0]
  const line = stackframe.getLineNumber()
  const fileName = stackframe.getFileName()
  const uri = fileName ? fileName.replace(/\//g, path.sep) : 'unknown'
  return { line, uri }
}

export function registerHandler(cwd, collection) {
  return (eventName, options, code) => {
    if (typeof options === 'function') {
      code = options
      options = {}
    }
    const { line, uri } = getDefinitionLineAndUri()
    validateArguments({
      args: { code, eventName, options },
      fnName: 'registerHandler',
      relativeUri: formatLocation(cwd, { line, uri })
    })
    const listener = _.assign(
      {
        [`handle${eventName}`]: code,
        relativeUri: formatLocation(cwd, { line, uri })
      },
      options
    )
    collection.push(listener)
  }
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
