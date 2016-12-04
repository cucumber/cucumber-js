import _ from 'lodash'
import arity from 'util-arity'
import isGenerator from 'is-generator'
import {Transform} from 'cucumber-expressions'
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
    transformLookup: TransformLookupBuilder.build()
  }
  let definitionFunctionWrapper = null
  const fnContext = {
    addTransform({captureGroupRegexps, transformer, typeName}) {
      const transform = new Transform(
        typeName,
        function() {},
        captureGroupRegexps,
        transformer
      )
      options.transformLookup.addTransform(transform)
    },
    After: helpers.defineHook(options.afterHookDefinitions),
    Before: helpers.defineHook(options.beforeHookDefinitions),
    defineStep: helpers.defineStep(options.stepDefinitions),
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
    World({attach, parameters}) {
      this.attach = attach
      this.parameters = parameters
    }
  }
  fnContext.Given = fnContext.When = fnContext.Then = fnContext.defineStep
  fns.forEach((fn) => fn.call(fnContext))
  wrapDefinitions({
    cwd,
    definitionFunctionWrapper,
    definitions: _.chain(['afterHook', 'beforeHook', 'step'])
      .map((key) => options[key + 'Definitions'])
      .flatten()
      .value()
  })
  options.World = fnContext.World
  return options
}

export function wrapDefinitions({cwd, definitionFunctionWrapper, definitions}) {
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
