import _ from 'lodash'
import { buildParameterType, getDefinitionLineAndUri } from './build_helpers'
import { IdGenerator } from '@cucumber/messages'
import * as messages from '@cucumber/messages'
import TestCaseHookDefinition from '../models/test_case_hook_definition'
import TestStepHookDefinition from '../models/test_step_hook_definition'
import TestRunHookDefinition from '../models/test_run_hook_definition'
import StepDefinition from '../models/step_definition'
import { formatLocation } from '../formatter/helpers'
import validateArguments from './validate_arguments'
import arity from 'util-arity'

import {
  CucumberExpression,
  ParameterTypeRegistry,
  RegularExpression,
} from '@cucumber/cucumber-expressions'
import { doesHaveValue, doesNotHaveValue } from '../value_checker'
import { validateNoGeneratorFunctions } from './finalize_helpers'
import {
  DefineStepPattern,
  IDefineStepOptions,
  IDefineSupportCodeMethods,
  IDefineTestCaseHookOptions,
  IDefineTestStepHookOptions,
  IDefineTestRunHookOptions,
  IParameterTypeDefinition,
  ISupportCodeLibrary,
  TestCaseHookFunction,
  TestStepHookFunction,
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

interface ITestStepHookDefinitionConfig {
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

export const builtinParameterTypes = ['int', 'float', 'word', 'string', '']

export class SupportCodeLibraryBuilder {
  public readonly methods: IDefineSupportCodeMethods

  private afterTestCaseHookDefinitionConfigs: ITestCaseHookDefinitionConfig[]
  private afterTestRunHookDefinitionConfigs: ITestRunHookDefinitionConfig[]
  private afterTestStepHookDefinitionConfigs: ITestStepHookDefinitionConfig[]
  private beforeTestCaseHookDefinitionConfigs: ITestCaseHookDefinitionConfig[]
  private beforeTestRunHookDefinitionConfigs: ITestRunHookDefinitionConfig[]
  private beforeTestStepHookDefinitionConfigs: ITestStepHookDefinitionConfig[]
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
      AfterStep: this.defineTestStepHook(
        () => this.afterTestStepHookDefinitionConfigs
      ),
      Before: this.defineTestCaseHook(
        () => this.beforeTestCaseHookDefinitionConfigs
      ),
      BeforeAll: this.defineTestRunHook(
        () => this.beforeTestRunHookDefinitionConfigs
      ),
      BeforeStep: this.defineTestStepHook(
        () => this.beforeTestStepHookDefinitionConfigs
      ),
      defineParameterType: this.defineParameterType.bind(this),
      defineStep,
      Given: defineStep,
      setDefaultTimeout: (milliseconds) => {
        this.defaultTimeout = milliseconds
      },
      setDefinitionFunctionWrapper: (fn) => {
        this.definitionFunctionWrapper = fn
      },
      setWorldConstructor: (fn) => {
        this.World = fn
      },
      Then: defineStep,
      When: defineStep,
    }
  }

  defineParameterType(options: IParameterTypeDefinition<any>): void {
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

  defineTestStepHook(
    getCollection: () => ITestStepHookDefinitionConfig[]
  ): (
    options: string | IDefineTestStepHookOptions | TestStepHookFunction,
    code?: TestStepHookFunction
  ) => void {
    return (
      options: string | IDefineTestStepHookOptions | TestStepHookFunction,
      code?: TestStepHookFunction
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
        fnName: 'defineTestStepHook',
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

  wrapCode({
    code,
    wrapperOptions,
  }: {
    code: Function
    wrapperOptions: any
  }): Function {
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

  buildTestStepHookDefinitions(
    configs: ITestStepHookDefinitionConfig[]
  ): TestStepHookDefinition[] {
    return configs.map(({ code, line, options, uri }) => {
      const wrappedCode = this.wrapCode({
        code,
        wrapperOptions: options.wrapperOptions,
      })
      return new TestStepHookDefinition({
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

  buildStepDefinitions(): {
    stepDefinitions: StepDefinition[]
    undefinedParameterTypes: messages.UndefinedParameterType[]
  } {
    const stepDefinitions: StepDefinition[] = []
    const undefinedParameterTypes: messages.UndefinedParameterType[] = []
    this.stepDefinitionConfigs.forEach(
      ({ code, line, options, pattern, uri }) => {
        let expression
        if (typeof pattern === 'string') {
          try {
            expression = new CucumberExpression(
              pattern,
              this.parameterTypeRegistry
            )
          } catch (e) {
            if (doesHaveValue(e.undefinedParameterTypeName)) {
              undefinedParameterTypes.push({
                name: e.undefinedParameterTypeName,
                expression: pattern,
              })
              return
            }
            throw e
          }
        } else {
          expression = new RegularExpression(
            pattern,
            this.parameterTypeRegistry
          )
        }

        const wrappedCode = this.wrapCode({
          code,
          wrapperOptions: options.wrapperOptions,
        })
        stepDefinitions.push(
          new StepDefinition({
            code: wrappedCode,
            expression,
            id: this.newId(),
            line,
            options,
            pattern,
            unwrappedCode: code,
            uri,
          })
        )
      }
    )
    return { stepDefinitions, undefinedParameterTypes }
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
    const stepDefinitionsResult = this.buildStepDefinitions()
    return {
      afterTestCaseHookDefinitions: this.buildTestCaseHookDefinitions(
        this.afterTestCaseHookDefinitionConfigs
      ),
      afterTestRunHookDefinitions: this.buildTestRunHookDefinitions(
        this.afterTestRunHookDefinitionConfigs
      ),
      afterTestStepHookDefinitions: this.buildTestStepHookDefinitions(
        this.afterTestStepHookDefinitionConfigs
      ),
      beforeTestCaseHookDefinitions: this.buildTestCaseHookDefinitions(
        this.beforeTestCaseHookDefinitionConfigs
      ),
      beforeTestRunHookDefinitions: this.buildTestRunHookDefinitions(
        this.beforeTestRunHookDefinitionConfigs
      ),
      beforeTestStepHookDefinitions: this.buildTestStepHookDefinitions(
        this.beforeTestStepHookDefinitionConfigs
      ),
      defaultTimeout: this.defaultTimeout,
      parameterTypeRegistry: this.parameterTypeRegistry,
      undefinedParameterTypes: stepDefinitionsResult.undefinedParameterTypes,
      stepDefinitions: stepDefinitionsResult.stepDefinitions,
      World: this.World,
    }
  }

  reset(cwd: string, newId: IdGenerator.NewId): void {
    this.cwd = cwd
    this.newId = newId
    this.afterTestCaseHookDefinitionConfigs = []
    this.afterTestRunHookDefinitionConfigs = []
    this.afterTestStepHookDefinitionConfigs = []
    this.beforeTestCaseHookDefinitionConfigs = []
    this.beforeTestRunHookDefinitionConfigs = []
    this.beforeTestStepHookDefinitionConfigs = []
    this.definitionFunctionWrapper = null
    this.defaultTimeout = 5000
    this.parameterTypeRegistry = new ParameterTypeRegistry()
    this.stepDefinitionConfigs = []
    this.World = World
  }
}

export default new SupportCodeLibraryBuilder()
