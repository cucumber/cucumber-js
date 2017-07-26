import _ from 'lodash'
import TransformLookupBuilder from './parameter_type_registry_builder'
import {
  addTransform,
  defineFeaturesHook,
  defineParameterType,
  defineScenarioHook,
  defineStep,
  registerHandler
} from './define_helpers'
import { wrapDefinitions } from './finalize_helpers'

export class SupportCodeLibraryBuilder {
  constructor() {
    this.methods = {
      addTransform: addTransform(this),
      defineParameterType: defineParameterType(this),
      After: defineScenarioHook(this, 'afterScenarioHookDefinitions'),
      AfterAll: defineFeaturesHook(this, 'afterFeaturesHookDefinitions'),
      Before: defineScenarioHook(this, 'beforeScenarioHookDefinitions'),
      BeforeAll: defineFeaturesHook(this, 'beforeFeaturesHookDefinitions'),
      defineSupportCode: fn => {
        fn(this.methods)
      },
      defineStep: defineStep(this),
      registerHandler: registerHandler(this),
      registerListener: listener => {
        this.options.listeners.push(listener)
      },
      setDefaultTimeout: milliseconds => {
        this.options.defaultTimeout = milliseconds
      },
      setDefinitionFunctionWrapper: fn => {
        this.options.definitionFunctionWrapper = fn
      },
      setWorldConstructor: fn => {
        this.options.World = fn
      }
    }
    this.methods.Given = this.methods.When = this.methods.Then = this.methods.defineStep
  }

  finalize() {
    wrapDefinitions({
      cwd: this.cwd,
      definitionFunctionWrapper: this.options.definitionFunctionWrapper,
      definitions: _.chain([
        'afterFeaturesHook',
        'afterScenarioHook',
        'beforeFeaturesHook',
        'beforeScenarioHook',
        'step'
      ])
        .map(key => this.options[key + 'Definitions'])
        .flatten()
        .value()
    })
    this.options.afterScenarioHookDefinitions.reverse()
    this.options.afterFeaturesHookDefinitions.reverse()
    return this.options
  }

  reset(cwd) {
    this.cwd = cwd
    this.options = _.cloneDeep({
      afterFeaturesHookDefinitions: [],
      afterScenarioHookDefinitions: [],
      beforeFeaturesHookDefinitions: [],
      beforeScenarioHookDefinitions: [],
      defaultTimeout: 5000,
      definitionFunctionWrapper: null,
      listeners: [],
      stepDefinitions: [],
      parameterTypeRegistry: TransformLookupBuilder.build(),
      World({ attach, parameters }) {
        this.attach = attach
        this.parameters = parameters
      }
    })
  }
}

export default new SupportCodeLibraryBuilder()
