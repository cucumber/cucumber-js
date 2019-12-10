import _ from 'lodash'
import util from 'util'
import TransformLookupBuilder from './parameter_type_registry_builder'
import {
  buildParameterType,
  buildStepDefinitionConfig,
  buildStepDefinitionFromConfig,
  buildTestCaseHookDefinition,
  buildTestRunHookDefinition,
} from './build_helpers'
import { wrapDefinitions } from './finalize_helpers'

export class SupportCodeLibraryBuilder {
  constructor() {
    this.methods = {
      defineParameterType: this.defineParameterType.bind(this),
      After: this.defineTestCaseHook('afterTestCaseHookDefinitions'),
      AfterAll: this.defineTestRunHook('afterTestRunHookDefinitions'),
      Before: this.defineTestCaseHook('beforeTestCaseHookDefinitions'),
      BeforeAll: this.defineTestRunHook('beforeTestRunHookDefinitions'),
      defineStep: this.defineStep.bind(this),
      defineSupportCode: util.deprecate(fn => {
        fn(this.methods)
      }, 'cucumber: defineSupportCode is deprecated. Please require/import the individual methods instead.'),
      setDefaultTimeout: milliseconds => {
        this.options.defaultTimeout = milliseconds
      },
      setDefinitionFunctionWrapper: fn => {
        this.options.definitionFunctionWrapper = fn
      },
      setWorldConstructor: fn => {
        this.options.World = fn
      },
    }
    this.methods.Given = this.methods.When = this.methods.Then = this.methods.defineStep
  }

  defineParameterType(options) {
    const parameterType = buildParameterType(options)
    this.options.parameterTypeRegistry.defineParameterType(parameterType)
  }

  defineStep(pattern, options, code) {
    const stepDefinitionConfig = buildStepDefinitionConfig({
      pattern,
      options,
      code,
      cwd: this.cwd,
    })
    this.options.stepDefinitionConfigs.push(stepDefinitionConfig)
  }

  defineTestCaseHook(collectionName) {
    return (options, code) => {
      const hookDefinition = buildTestCaseHookDefinition({
        options,
        code,
        cwd: this.cwd,
        id: this.newId(),
      })
      this.options[collectionName].push(hookDefinition)
    }
  }

  defineTestRunHook(collectionName) {
    return (options, code) => {
      const hookDefinition = buildTestRunHookDefinition({
        options,
        code,
        cwd: this.cwd,
        id: this.newId(),
      })
      this.options[collectionName].push(hookDefinition)
    }
  }

  finalize() {
    this.options.stepDefinitions = this.options.stepDefinitionConfigs.map(
      config =>
        buildStepDefinitionFromConfig({
          id: this.newId(),
          config,
          parameterTypeRegistry: this.options.parameterTypeRegistry,
        })
    )
    delete this.options.stepDefinitionConfigs
    wrapDefinitions({
      cwd: this.cwd,
      definitionFunctionWrapper: this.options.definitionFunctionWrapper,
      definitions: _.chain([
        'afterTestCaseHook',
        'afterTestRunHook',
        'beforeTestCaseHook',
        'beforeTestRunHook',
        'step',
      ])
        .map(key => this.options[`${key}Definitions`])
        .flatten()
        .value(),
    })
    this.options.afterTestCaseHookDefinitions.reverse()
    this.options.afterTestRunHookDefinitions.reverse()
    return this.options
  }

  reset(cwd, newId) {
    this.cwd = cwd
    this.newId = newId
    this.options = _.cloneDeep({
      afterTestCaseHookDefinitions: [],
      afterTestRunHookDefinitions: [],
      beforeTestCaseHookDefinitions: [],
      beforeTestRunHookDefinitions: [],
      defaultTimeout: 5000,
      definitionFunctionWrapper: null,
      stepDefinitionConfigs: [],
      parameterTypeRegistry: TransformLookupBuilder.build(),
      World({ attach, parameters }) {
        this.attach = attach
        this.parameters = parameters
      },
    })
  }
}

export default new SupportCodeLibraryBuilder()
