import _ from 'lodash'
import arity from 'util-arity'
import isGenerator from 'is-generator'
import path from 'path'
import TransformLookupBuilder from './parameter_type_registry_builder'
import * as helpers from './helpers'
function build({ cwd, fns }) {
  const options = {
    afterFeaturesHookDefinitions: [],
    afterScenarioHookDefinitions: [],
    beforeFeaturesHookDefinitions: [],
    beforeScenarioHookDefinitions: [],
    defaultTimeout: 5000,
    listeners: [],
    stepDefinitions: [],
    parameterTypeRegistry: TransformLookupBuilder.build(),
    World({ attach, parameters }) {
      this.attach = attach
      this.parameters = parameters
    }
  }
  let definitionFunctionWrapper = null
  const fnArgument = {
    addTransform: helpers.addTransform(options.parameterTypeRegistry),
    defineParameterType: helpers.defineParameterType(
      options.parameterTypeRegistry
    ),
    After: helpers.defineScenarioHook(
      cwd,
      options.afterScenarioHookDefinitions
    ),
    AfterAll: helpers.defineFeaturesHook(
      cwd,
      options.afterFeaturesHookDefinitions
    ),
    Before: helpers.defineScenarioHook(
      cwd,
      options.beforeScenarioHookDefinitions
    ),
    BeforeAll: helpers.defineFeaturesHook(
      cwd,
      options.beforeFeaturesHookDefinitions
    ),
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
  fns.forEach(fn => fn(fnArgument))
  wrapDefinitions({
    cwd,
    definitionFunctionWrapper,
    definitions: _.chain([
      'afterFeaturesHook',
      'afterScenarioHook',
      'beforeFeaturesHook',
      'beforeScenarioHook',
      'step'
    ])
      .map(key => options[key + 'Definitions'])
      .flatten()
      .value()
  })
  options.afterScenarioHookDefinitions.reverse()
  options.afterFeaturesHookDefinitions.reverse()
  return options
}

function wrapDefinitions({ cwd, definitionFunctionWrapper, definitions }) {
  if (definitionFunctionWrapper) {
    definitions.forEach(definition => {
      const codeLength = definition.code.length
      const wrappedFn = definitionFunctionWrapper(
        definition.code,
        definition.options.wrapperOptions
      )
      if (wrappedFn !== definition.code) {
        definition.code = arity(codeLength, wrappedFn)
      }
    })
  } else {
    const generatorDefinitions = _.filter(definitions, definition => {
      return isGenerator.fn(definition.code)
    })
    if (generatorDefinitions.length > 0) {
      const references = generatorDefinitions
        .map(definition => {
          return path.relative(cwd, definition.uri) + ':' + definition.line
        })
        .join('\n  ')
      const message = `
        The following hook/step definitions use generator functions:

          ${references}

        Use 'this.setDefinitionFunctionWrapper(fn)' to wrap then in a function that returns a promise.
        `
      throw new Error(message)
    }
  }
}

export default { build }
