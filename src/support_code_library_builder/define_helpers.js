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

export function defineScenarioHook(builder, collectionName) {
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
      fnName: 'defineScenarioHook',
      location: formatLocation({ line, uri })
    })
    const hookDefinition = new ScenarioHookDefinition({
      code,
      line,
      options,
      uri
    })
    builder.options[collectionName].push(hookDefinition)
  }
}

export function defineFeaturesHook(builder, collectionName) {
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
      fnName: 'defineFeaturesHook',
      location: formatLocation({ line, uri })
    })
    const hookDefinition = new FeaturesHookDefinition({
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

export function registerHandler(builder) {
  return (eventName, options, code) => {
    if (typeof options === 'function') {
      code = options
      options = {}
    }
    const { line, uri } = getDefinitionLineAndUri(builder.cwd)
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
    builder.options.listeners.push(listener)
  }
}

export function addTransform(builder) {
  return util.deprecate(({ captureGroupRegexps, transformer, typeName }) => {
    const parameter = new ParameterType(
      typeName,
      null,
      captureGroupRegexps,
      transformer
    )
    builder.options.parameterTypeRegistry.defineParameterType(parameter)
  }, 'addTransform is deprecated and will be removed in a future version. Please use defineParameterType instead.')
}

export function defineParameterType(builder) {
  return ({ regexp, transformer, typeName }) => {
    const parameter = new ParameterType(typeName, null, regexp, transformer)
    builder.options.parameterTypeRegistry.defineParameterType(parameter)
  }
}
