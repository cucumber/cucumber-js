import { buildParameterType } from './build_parameter_type'
import { getDefinitionLineAndUri } from './get_definition_line_and_uri'
import { IdGenerator } from '@cucumber/messages'
import * as messages from '@cucumber/messages'
import TestCaseHookDefinition from '../models/test_case_hook_definition'
import TestStepHookDefinition from '../models/test_step_hook_definition'
import TestRunHookDefinition from '../models/test_run_hook_definition'
import StepDefinition from '../models/step_definition'
import { formatLocation } from '../formatter/helpers'
import validateArguments from './validate_arguments'
import { deprecate } from 'util'
import arity from 'util-arity'

import {
  CucumberExpression,
  ParameterTypeRegistry,
  RegularExpression,
} from '@cucumber/cucumber-expressions'
import { doesHaveValue } from '../value_checker'
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
  ParallelAssignmentValidator,
  ISupportCodeCoordinates,
  IDefineStep,
} from './types'
import World from './world'
import { ICanonicalSupportCodeIds } from '../runtime/parallel/command_types'
import { GherkinStepKeyword } from '../models/gherkin_step_keyword'

interface IStepDefinitionConfig {
  code: any
  line: number
  options: any
  keyword: GherkinStepKeyword
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

export const builtinParameterTypes = [
  'bigdecimal',
  'biginteger',
  'byte',
  'double',
  'float',
  'int',
  'long',
  'short',
  'string',
  'word',
  '',
]

export class SupportCodeLibraryBuilder {
  public readonly methods: IDefineSupportCodeMethods

  private originalCoordinates: ISupportCodeCoordinates
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
  private parallelCanAssign: ParallelAssignmentValidator

  constructor() {
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
      defineStep: deprecate(
        this.defineStep('Unknown', () => this.stepDefinitionConfigs),
        '`defineStep` is deprecated, use `Given`, `When` or `Then` instead; see https://github.com/cucumber/cucumber-js/issues/2043'
      ),
      Given: this.defineStep('Given', () => this.stepDefinitionConfigs),
      setDefaultTimeout: (milliseconds) => {
        this.defaultTimeout = milliseconds
      },
      setDefinitionFunctionWrapper: (fn) => {
        this.definitionFunctionWrapper = fn
      },
      setWorldConstructor: (fn) => {
        this.World = fn
      },
      setParallelCanAssign: (fn: ParallelAssignmentValidator): void => {
        this.parallelCanAssign = fn
      },
      Then: this.defineStep('Then', () => this.stepDefinitionConfigs),
      When: this.defineStep('When', () => this.stepDefinitionConfigs),
    }
  }

  defineParameterType(options: IParameterTypeDefinition<any>): void {
    const parameterType = buildParameterType(options)
    this.parameterTypeRegistry.defineParameterType(parameterType)
  }

  defineStep(
    keyword: GherkinStepKeyword,
    getCollection: () => IStepDefinitionConfig[]
  ): IDefineStep {
    return (
      pattern: DefineStepPattern,
      options: IDefineStepOptions | Function,
      code?: Function
    ) => {
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
      getCollection().push({
        code,
        line,
        options,
        keyword,
        pattern,
        uri,
      })
    }
  }

  defineTestCaseHook(
    getCollection: () => ITestCaseHookDefinitionConfig[]
  ): <WorldType>(
    options:
      | string
      | IDefineTestCaseHookOptions
      | TestCaseHookFunction<WorldType>,
    code?: TestCaseHookFunction<WorldType>
  ) => void {
    return <WorldType>(
      options:
        | string
        | IDefineTestCaseHookOptions
        | TestCaseHookFunction<WorldType>,
      code?: TestCaseHookFunction<WorldType>
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
  ): <WorldType>(
    options:
      | string
      | IDefineTestStepHookOptions
      | TestStepHookFunction<WorldType>,
    code?: TestStepHookFunction<WorldType>
  ) => void {
    return <WorldType>(
      options:
        | string
        | IDefineTestStepHookOptions
        | TestStepHookFunction<WorldType>,
      code?: TestStepHookFunction<WorldType>
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
    configs: ITestCaseHookDefinitionConfig[],
    canonicalIds?: string[]
  ): TestCaseHookDefinition[] {
    return configs.map(({ code, line, options, uri }, index) => {
      const wrappedCode = this.wrapCode({
        code,
        wrapperOptions: options.wrapperOptions,
      })
      return new TestCaseHookDefinition({
        code: wrappedCode,
        id: canonicalIds ? canonicalIds[index] : this.newId(),
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

  buildStepDefinitions(canonicalIds?: string[]): {
    stepDefinitions: StepDefinition[]
    undefinedParameterTypes: messages.UndefinedParameterType[]
  } {
    const stepDefinitions: StepDefinition[] = []
    const undefinedParameterTypes: messages.UndefinedParameterType[] = []
    this.stepDefinitionConfigs.forEach(
      ({ code, line, options, keyword, pattern, uri }, index) => {
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
            id: canonicalIds ? canonicalIds[index] : this.newId(),
            line,
            options,
            keyword,
            pattern,
            unwrappedCode: code,
            uri,
          })
        )
      }
    )
    return { stepDefinitions, undefinedParameterTypes }
  }

  finalize(canonicalIds?: ICanonicalSupportCodeIds): ISupportCodeLibrary {
    const stepDefinitionsResult = this.buildStepDefinitions(
      canonicalIds?.stepDefinitionIds
    )
    return {
      originalCoordinates: this.originalCoordinates,
      afterTestCaseHookDefinitions: this.buildTestCaseHookDefinitions(
        this.afterTestCaseHookDefinitionConfigs,
        canonicalIds?.afterTestCaseHookDefinitionIds
      ),
      afterTestRunHookDefinitions: this.buildTestRunHookDefinitions(
        this.afterTestRunHookDefinitionConfigs
      ),
      afterTestStepHookDefinitions: this.buildTestStepHookDefinitions(
        this.afterTestStepHookDefinitionConfigs
      ),
      beforeTestCaseHookDefinitions: this.buildTestCaseHookDefinitions(
        this.beforeTestCaseHookDefinitionConfigs,
        canonicalIds?.beforeTestCaseHookDefinitionIds
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
      parallelCanAssign: this.parallelCanAssign,
    }
  }

  reset(
    cwd: string,
    newId: IdGenerator.NewId,
    originalCoordinates: ISupportCodeCoordinates = {
      requireModules: [],
      requirePaths: [],
      importPaths: [],
    }
  ): void {
    this.cwd = cwd
    this.newId = newId
    this.originalCoordinates = originalCoordinates
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
    this.parallelCanAssign = () => true
    this.World = World
  }
}

export default new SupportCodeLibraryBuilder()
