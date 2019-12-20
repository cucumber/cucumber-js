import _ from 'lodash'
import TransformLookupBuilder from './parameter_type_registry_builder'
import {
  buildParameterType,
  buildStepDefinitionConfig,
  buildStepDefinitionFromConfig,
  buildTestCaseHookDefinition,
  buildTestRunHookDefinition,
  IStepDefinitionConfig,
} from './build_helpers'
import { wrapDefinitions } from './finalize_helpers'
import { IdGenerator, messages } from 'cucumber-messages'
import TestCaseHookDefinition from '../models/test_case_hook_definition'
import TestRunHookDefinition from '../models/test_run_hook_definition'
import StepDefinition from '../models/step_definition'
import ParameterTypeRegistry from 'cucumber-expressions/dist/src/ParameterTypeRegistry'
import { IAttachment } from '../runtime/attachment_manager'

export type DefineStepPattern = string | RegExp

export interface ITestCaseHookParameter {
  gherkinDocument: messages.IGherkinDocument
  pickle: messages.IPickle
  result?: messages.ITestResult
  testCaseStartedId: string
}

export type TestCaseHookFunctionWithoutParameter = () => void
export type TestCaseHookFunctionWithParameter = (
  arg: ITestCaseHookParameter
) => void
export type TestCaseHookFunction =
  | TestCaseHookFunctionWithoutParameter
  | TestCaseHookFunctionWithParameter

export interface IDefineStepOptions {
  timeout?: number
  wrapperOptions?: any
}

export interface IDefineTestCaseHookOptions {
  tags?: string
  timeout?: number
}

export interface IDefineTestRunHookOptions {
  timeout?: number
}

export interface IDefineSupportCodeMethods {
  defineParameterType(options: any): void
  defineStep(pattern: DefineStepPattern, code: Function): void
  defineStep(
    pattern: DefineStepPattern,
    options: IDefineStepOptions,
    code: Function
  ): void
  setDefaultTimeout(milliseconds: number): void
  setDefinitionFunctionWrapper(fn: Function): void
  setWorldConstructor(fn: any): void
  After(code: TestCaseHookFunction): void
  After(tags: string, code: TestCaseHookFunction): void
  After(options: IDefineTestCaseHookOptions, code: TestCaseHookFunction): void
  AfterAll(code: Function): void
  AfterAll(options: IDefineTestRunHookOptions, code: Function): void
  Before(code: TestCaseHookFunction): void
  Before(tags: string, code: TestCaseHookFunction): void
  Before(options: IDefineTestCaseHookOptions, code: TestCaseHookFunction): void
  BeforeAll(code: Function): void
  BeforeAll(options: IDefineTestRunHookOptions, code: Function): void
  Given(pattern: DefineStepPattern, code: Function): void
  Given(
    pattern: DefineStepPattern,
    options: IDefineStepOptions,
    code: Function
  ): void
  Then(pattern: DefineStepPattern, code: Function): void
  Then(
    pattern: DefineStepPattern,
    options: IDefineStepOptions,
    code: Function
  ): void
  When(pattern: DefineStepPattern, code: Function): void
  When(
    pattern: DefineStepPattern,
    options: IDefineStepOptions,
    code: Function
  ): void
}

export interface ISupportCodeLibrary {
  afterTestCaseHookDefinitions: TestCaseHookDefinition[]
  afterTestRunHookDefinitions: TestRunHookDefinition[]
  beforeTestCaseHookDefinitions: TestCaseHookDefinition[]
  beforeTestRunHookDefinitions: TestRunHookDefinition[]
  defaultTimeout: number
  stepDefinitions: StepDefinition[]
  parameterTypeRegistry: ParameterTypeRegistry
  World: any
}

export class World {
  private readonly attach: (attachment: IAttachment) => void
  private readonly parameters: any

  constructor({ attach, parameters }) {
    this.attach = attach
    this.parameters = parameters
  }
}

export class SupportCodeLibraryBuilder {
  public methods: IDefineSupportCodeMethods
  private cwd: string
  private newId: IdGenerator.NewId
  private options: ISupportCodeLibrary
  private definitionFunctionWrapper: any
  private stepDefinitionConfigs: IStepDefinitionConfig[]

  constructor() {
    const defineStep = this.defineStep.bind(this)
    this.methods = {
      After: this.defineTestCaseHook('afterTestCaseHookDefinitions'),
      AfterAll: this.defineTestRunHook('afterTestRunHookDefinitions'),
      Before: this.defineTestCaseHook('beforeTestCaseHookDefinitions'),
      BeforeAll: this.defineTestRunHook('beforeTestRunHookDefinitions'),
      defineParameterType: this.defineParameterType.bind(this),
      defineStep,
      Given: defineStep,
      setDefaultTimeout: milliseconds => {
        this.options.defaultTimeout = milliseconds
      },
      setDefinitionFunctionWrapper: fn => {
        this.definitionFunctionWrapper = fn
      },
      setWorldConstructor: fn => {
        this.options.World = fn
      },
      Then: defineStep,
      When: defineStep,
    }
  }

  defineParameterType(options) {
    const parameterType = buildParameterType(options)
    this.options.parameterTypeRegistry.defineParameterType(parameterType)
  }

  defineStep(
    pattern: DefineStepPattern,
    options: IDefineStepOptions | Function,
    code?: Function
  ) {
    const stepDefinitionConfig = buildStepDefinitionConfig({
      pattern,
      options,
      code,
      cwd: this.cwd,
    })
    this.stepDefinitionConfigs.push(stepDefinitionConfig)
  }

  defineTestCaseHook(collectionName: string) {
    return (
      options: string | IDefineTestCaseHookOptions | TestCaseHookFunction,
      code?: TestCaseHookFunction
    ) => {
      const hookDefinition = buildTestCaseHookDefinition({
        options,
        code,
        cwd: this.cwd,
        id: this.newId(),
      })
      this.options[collectionName].push(hookDefinition)
    }
  }

  defineTestRunHook(collectionName: string) {
    return (options: IDefineTestRunHookOptions | Function, code?: Function) => {
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
    this.options.stepDefinitions = this.stepDefinitionConfigs.map(config =>
      buildStepDefinitionFromConfig({
        id: this.newId(),
        config,
        parameterTypeRegistry: this.options.parameterTypeRegistry,
      })
    )
    wrapDefinitions({
      cwd: this.cwd,
      definitionFunctionWrapper: this.definitionFunctionWrapper,
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

  reset(cwd: string, newId: IdGenerator.NewId) {
    this.cwd = cwd
    this.newId = newId
    this.definitionFunctionWrapper = null
    this.stepDefinitionConfigs = []
    this.options = _.cloneDeep({
      afterTestCaseHookDefinitions: [],
      afterTestRunHookDefinitions: [],
      beforeTestCaseHookDefinitions: [],
      beforeTestRunHookDefinitions: [],
      defaultTimeout: 5000,
      parameterTypeRegistry: TransformLookupBuilder.build(),
      stepDefinitions: [],
      World,
    })
  }
}

export default new SupportCodeLibraryBuilder()
