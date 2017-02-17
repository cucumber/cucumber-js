import _ from 'lodash'
import arity from 'util-arity'
import isGenerator from 'is-generator'
import {Parameter} from 'cucumber-expressions'
import path from 'path'
import TransformLookupBuilder from './transform_lookup_builder'
import * as helpers from './helpers'

function build({cwd, fns}) {
  const options = {
    afterHookDefinitions: [],
    beforeHookDefinitions: [],
    defaultTimeout: 5000,
    listeners: [],
    stepDefinitions: [],
    parameterRegistry: TransformLookupBuilder.build(),
    World({attach, parameters}) {
      this.attach = attach
      this.parameters = parameters
    }
  }
  let definitionFunctionWrapper = null
  function addParameter({captureGroupRegexps, transformer, typeName}) {
    const parameter = new Parameter(
      typeName,
      function() {},
      captureGroupRegexps,
      transformer
    )
    options.parameterRegistry.addParameter(parameter)
  }
  function addTransform({captureGroupRegexps, transformer, typeName}) {
    // eslint-disable-next-line no-console
    if (console !== 'undefined' && typeof console.error === 'function') {
      // eslint-disable-next-line no-console
      console.error('addTransform is obsolete and will be removed in a future version. Please use addParameter instead.')
    }
    addParameter({captureGroupRegexps, transformer, typeName})
  }
  const fnArgument = {
    addParameter,
    addTransform,
    After: helpers.defineHook(cwd, options.afterHookDefinitions),
    Before: helpers.defineHook(cwd, options.beforeHookDefinitions),
    defineStep: helpers.defineStep(cwd, options.stepDefinitions),
    registerHandler: helpers.registerHandler(cwd, options.listeners),
    registerListener(listener) {
      options.listeners.push(listener)
    },
    setDefaultTimeout(milliseconds) {
      options.defaultTimeout = milliseconds
    },
    setDefinitionFunctionWrapper(fn) {
      definitionFunctionWrapper = fn
    },
    setWorldConstructor(fn) {
      options.World = fn
    }
  }
  fnArgument.Given = fnArgument.When = fnArgument.Then = fnArgument.defineStep
  fns.forEach((fn) => fn(fnArgument))
  wrapDefinitions({
    cwd,
    definitionFunctionWrapper,
    definitions: _.chain(['afterHook', 'beforeHook', 'step'])
      .map((key) => options[key + 'Definitions'])
      .flatten()
      .value()
  })
  options.afterHookDefinitions.reverse()
  return options
}

function wrapDefinitions({cwd, definitionFunctionWrapper, definitions}) {
  if (definitionFunctionWrapper) {
    definitions.forEach((definition) => {
      const codeLength = definition.code.length
      const wrappedFn = definitionFunctionWrapper(definition.code)
      if (wrappedFn !== definition.code) {
        definition.code = arity(codeLength, wrappedFn)
      }
    })
  } else {
    const generatorDefinitions = _.filter(definitions, (definition) => {
      return isGenerator.fn(definition.code)
    })
    if (generatorDefinitions.length > 0) {
      const references = generatorDefinitions.map((definition) => {
        return path.relative(cwd, definition.uri) + ':' + definition.line
      }).join('\n  ')
      const message = `
        The following hook/step definitions use generator functions:

          ${references}

        Use 'this.setDefinitionFunctionWrapper(fn)' to wrap then in a function that returns a promise.
        `
      throw new Error(message)
    }
  }
}

export default {build}
