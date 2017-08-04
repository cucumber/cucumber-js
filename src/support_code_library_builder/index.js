import _ from 'lodash'
import TransformLookupBuilder from './parameter_type_registry_builder'
import {
  defineTestRunHook,
  defineParameterType,
  defineTestCaseHook,
  defineStep
} from './define_helpers'
import { wrapDefinitions } from './finalize_helpers'

export class SupportCodeLibraryBuilder {
  constructor() {
    this.methods = {
      defineParameterType: defineParameterType(this),
      After: defineTestCaseHook(this, 'afterTestCaseHookDefinitions'),
      AfterAll: defineTestRunHook(this, 'afterTestRunHookDefinitions'),
      Before: defineTestCaseHook(this, 'beforeTestCaseHookDefinitions'),
      BeforeAll: defineTestRunHook(this, 'beforeTestRunHookDefinitions'),
      defineSupportCode: fn => {
        fn(this.methods)
      },
      defineStep: defineStep(this),
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
        'afterTestCaseHook',
        'afterTestRunHook',
        'beforeTestCaseHook',
        'beforeTestRunHook',
        'step'
      ])
        .map(key => this.options[key + 'Definitions'])
        .flatten()
        .value()
    })
    this.options.afterTestCaseHookDefinitions.reverse()
    this.options.afterTestRunHookDefinitions.reverse()
    return this.options
  }

  reset(cwd) {
    this.cwd = cwd
    this.options = _.cloneDeep({
      afterTestCaseHookDefinitions: [],
      afterTestRunHookDefinitions: [],
      beforeTestCaseHookDefinitions: [],
      beforeTestRunHookDefinitions: [],
      defaultTimeout: 5000,
      definitionFunctionWrapper: null,
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
