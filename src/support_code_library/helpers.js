import _ from 'lodash'
import HookDefinition from '../models/hook_definition'
import StackTrace from 'stacktrace-js'
import StepDefinition from '../models/step_definition'

export function defineHook(collection) {
  return (options, code) => {
    if (typeof(options) === 'string') {
      options = {tags: options}
    } else if (typeof(options) === 'function') {
      code = options
      options = {}
    }
    const {line, uri} = getDefinitionLineAndUri()
    const hookDefinition = new HookDefinition({code, line, options, uri})
    collection.push(hookDefinition)
  }
}

export function defineStep(collection) {
  return (pattern, options, code) => {
    if (typeof(options) === 'function') {
      code = options
      options = {}
    }
    const {line, uri} = getDefinitionLineAndUri()
    const stepDefinition = new StepDefinition({code, line, options, pattern, uri})
    collection.push(stepDefinition)
  }
}

function getDefinitionLineAndUri() {
  const stackframes = StackTrace.getSync()
  const stackframe = stackframes.length > 2 ? stackframes[2] : stackframes[0]
  const line = stackframe.getLineNumber()
  const uri = stackframe.getFileName() || 'unknown'
  return {line, uri}
}

export function registerHandler(cwd, collection) {
  return (eventName, options, handler) => {
    if (typeof(options) === 'function') {
      handler = options
      options = {}
    }
    const {line, uri} = getDefinitionLineAndUri()
    const listener = _.assign({
      cwd,
      [`handle${eventName}`]: handler,
      line,
      uri
    }, options)
    collection.push(listener)
  }
}
