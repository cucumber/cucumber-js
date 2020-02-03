import _ from 'lodash'
import { buildParameterType, getDefinitionLineAndUri } from './build_helpers'
import { IdGenerator } from 'cucumber-messages'
import TestCaseHookDefinition from '../models/test_case_hook_definition'
import TestRunHookDefinition from '../models/test_run_hook_definition'
import StepDefinition from '../models/step_definition'
import { formatLocation } from '../formatter/helpers'
import validateArguments from './validate_arguments'
import arity from 'util-arity'
import {
  CucumberExpression,
  RegularExpression,
  ParameterTypeRegistry,
} from 'cucumber-expressions'
import { doesHaveValue, doesNotHaveValue } from '../value_checker'
import { validateNoGeneratorFunctions } from './finalize_helpers'
import {
  IDefineSupportCodeMethods,
  DefineStepPattern,
  IDefineStepOptions,
  IDefineTestCaseHookOptions,
  TestCaseHookFunction,
  IDefineTestRunHookOptions,
  ISupportCodeLibrary, IParameterTypeOptions,
} from './types'
import World from './world'

interface IStepDefinitionConfig {
  code: any
  line: number
  options: any
  pattern: string | RegExp
  uri: string
}

interface ITestCaseHookDefinitionConfig {
  code: any
  line: number
  options: any
  uri: string
}

interface ITestRunHookDefinitionConfig {
  code: any
  line: number
  options: any
  uri: string
}

export class SupportCodeLibraryBuilder {
  public readonly methods: IDefineSupportCodeMethods

  private afterTestCaseHookDefinitionConfigs: ITestCaseHookDefinitionConfig[]
  private afterTestRunHookDefinitionConfigs: ITestRunHookDefinitionConfig[]
  private beforeTestCaseHookDefinitionConfigs: ITestCaseHookDefinitionConfig[]
  private beforeTestRunHookDefinitionConfigs: ITestRunHookDefinitionConfig[]
  private cwd: string
  private defaultTimeout: number
  private definitionFunctionWrapper: any
  private newId: IdGenerator.NewId
  private parameterTypeRegistry: ParameterTypeRegistry
  private stepDefinitionConfigs: IStepDefinitionConfig[]
  private World: any

  constructor() {
    const defineStep = this.defineStep.bind(this)
    this.methods = {
      After: this.defineTestCaseHook(
        () => this.afterTestCaseHookDefinitionConfigs
      ),
      AfterAll: this.defineTestRunHook(
        () => this.afterTestRunHookDefinitionConfigs
      ),
      Before: this.defineTestCaseHook(
        () => this.beforeTestCaseHookDefinitionConfigs
      ),
      BeforeAll: this.defineTestRunHook(
        () => this.beforeTestRunHookDefinitionConfigs
      ),
      defineParameterType: this.defineParameterType.bind(this),
      defineStep,
      Given: defineStep,
      setDefaultTimeout: milliseconds => {
        this.defaultTimeout = milliseconds
      },
      setDefinitionFunctionWrapper: fn => {
        this.definitionFunctionWrapper = fn
      },
      setWorldConstructor: fn => {
        this.World = fn
      },
      Then: defineStep,
      When: defineStep,
    }
  }

  defineParameterType(options: IParameterTypeOptions<any>): void {
    const parameterType = buildParameterType(options)
    this.parameterTypeRegistry.defineParameterType(parameterType)
  }

  defineStep(
    pattern: DefineStepPattern,
    options: IDefineStepOptions | Function,
    code?: Function
  ): void {
    if (typeof options === 'function') {
      code = options
      options = {}
    }
    const { line, uri } = getDefinitionLineAndUri(this.cwd)
    validateArguments({
      args: { code, pattern, options },
      fnName: 'defineStep',
      location: formatLocation({ line, uri }),
    })
    this.stepDefinitionConfigs.push({
      code,
      line,
      options,
      pattern,
      uri,
    })
  }

  defineTestCaseHook(
    getCollection: () => ITestCaseHookDefinitionConfig[]
  ): (
    options: string | IDefineTestCaseHookOptions | TestCaseHookFunction,
    code?: TestCaseHookFunction
  ) => void {
    return (
      options: string | IDefineTestCaseHookOptions | TestCaseHookFunction,
      code?: TestCaseHookFunction
    ) => {
      if (typeof options === 'string') {
        options = { tags: options }
      } else if (typeof options === 'function') {
        code = options
        options = {}
      }
      const { line, uri } = getDefinitionLineAndUri(this.cwd)
      validateArguments({
        args: { code, options },
        fnName: 'defineTestCaseHook',
        location: formatLocation({ line, uri }),
      })
      getCollection().push({
        code,
        line,
        options,
        uri,
      })
    }
  }

  defineTestRunHook(
    getCollection: () => ITestRunHookDefinitionConfig[]
  ): (options: IDefineTestRunHookOptions | Function, code?: Function) => void {
    return (options: IDefineTestRunHookOptions | Function, code?: Function) => {
      if (typeof options === 'function') {
        code = options
        options = {}
      }
      const { line, uri } = getDefinitionLineAndUri(this.cwd)
      validateArguments({
        args: { code, options },
        fnName: 'defineTestRunHook',
        location: formatLocation({ line, uri }),
      })
      getCollection().push({
        code,
        line,
        options,
        uri,
      })
    }
  }

  wrapCode({ code, wrapperOptions }: {code: Function, wrapperOptions: any}): Function {
    if (doesHaveValue(this.definitionFunctionWrapper)) {
      const codeLength = code.length
      const wrappedCode = this.definitionFunctionWrapper(code, wrapperOptions)
      if (wrappedCode !== code) {
        return arity(codeLength, wrappedCode)
      }
      return wrappedCode
    }
    return code
  }

  buildTestCaseHookDefinitions(
    configs: ITestCaseHookDefinitionConfig[]
  ): TestCaseHookDefinition[] {
    return configs.map(({ code, line, options, uri }) => {
      const wrappedCode = this.wrapCode({
        code,
        wrapperOptions: options.wrapperOptions,
      })
      return new TestCaseHookDefinition({
        code: wrappedCode,
        id: this.newId(),
        line,
        options,
        unwrappedCode: code,
        uri,
      })
    })
  }

  buildTestRunHookDefinitions(
    configs: ITestRunHookDefinitionConfig[]
  ): TestRunHookDefinition[] {
    return configs.map(({ code, line, options, uri }) => {
      const wrappedCode = this.wrapCode({
        code,
        wrapperOptions: options.wrapperOptions,
      })
      return new TestRunHookDefinition({
        code: wrappedCode,
        id: this.newId(),
        line,
        options,
        unwrappedCode: code,
        uri,
      })
    })
  }

  buildStepDefinitions(): StepDefinition[] {
    return this.stepDefinitionConfigs.map(
      ({ code, line, options, pattern, uri }) => {
        const expression =
          typeof pattern === 'string'
            ? new CucumberExpression(pattern, this.parameterTypeRegistry)
            : new RegularExpression(pattern, this.parameterTypeRegistry)
        const wrappedCode = this.wrapCode({
          code,
          wrapperOptions: options.wrapperOptions,
        })
        return new StepDefinition({
          code: wrappedCode,
          expression,
          id: this.newId(),
          line,
          options,
          pattern,
          unwrappedCode: code,
          uri,
        })
      }
    )
  }

  finalize(): ISupportCodeLibrary {
    if (doesNotHaveValue(this.definitionFunctionWrapper)) {
      const definitionConfigs = _.chain([
        this.afterTestCaseHookDefinitionConfigs,
        this.afterTestRunHookDefinitionConfigs,
        this.beforeTestCaseHookDefinitionConfigs,
        this.beforeTestRunHookDefinitionConfigs,
        this.stepDefinitionConfigs,
      ])
        .flatten()
        .value()
      validateNoGeneratorFunctions({ cwd: this.cwd, definitionConfigs })
    }
    return {
      afterTestCaseHookDefinitions: this.buildTestCaseHookDefinitions(
        this.afterTestCaseHookDefinitionConfigs
      ).reverse(),
      afterTestRunHookDefinitions: this.buildTestRunHookDefinitions(
        this.afterTestRunHookDefinitionConfigs
      ).reverse(),
      beforeTestCaseHookDefinitions: this.buildTestCaseHookDefinitions(
        this.beforeTestCaseHookDefinitionConfigs
      ),
      beforeTestRunHookDefinitions: this.buildTestRunHookDefinitions(
        this.beforeTestRunHookDefinitionConfigs
      ),
      defaultTimeout: this.defaultTimeout,
      parameterTypeRegistry: this.parameterTypeRegistry,
      stepDefinitions: this.buildStepDefinitions(),
      World: this.World,
    }
  }

  reset(cwd: string, newId: IdGenerator.NewId): void {
    this.cwd = cwd
    this.newId = newId
    this.afterTestCaseHookDefinitionConfigs = []
    this.afterTestRunHookDefinitionConfigs = []
    this.beforeTestCaseHookDefinitionConfigs = []
    this.beforeTestRunHookDefinitionConfigs = []
    this.definitionFunctionWrapper = null
    this.defaultTimeout = 5000
    this.parameterTypeRegistry = new ParameterTypeRegistry()
    this.stepDefinitionConfigs = []
    this.World = World
  }
}

export default new SupportCodeLibraryBuilder()
