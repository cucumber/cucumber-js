import * as messages from '@cucumber/messages'
import TestCaseHookDefinition from '../models/test_case_hook_definition'
import TestStepHookDefinition from '../models/test_step_hook_definition'
import TestRunHookDefinition from '../models/test_run_hook_definition'
import StepDefinition from '../models/step_definition'
import { ParameterTypeRegistry } from '@cucumber/cucumber-expressions'

export type DefineStepPattern = string | RegExp

export interface ITestCaseHookParameter {
  gherkinDocument: messages.GherkinDocument
  pickle: messages.Pickle
  result?: messages.TestStepResult
  testCaseStartedId: string
}

export interface ITestStepHookParameter {
  gherkinDocument: messages.GherkinDocument
  pickle: messages.Pickle
  result: messages.TestStepResult
  testCaseStartedId: string
  testStepId: string
}

export type TestCaseHookFunction = (
  this: any,
  arg?: ITestCaseHookParameter
) => any | Promise<any>

export type TestStepHookFunction = (
  this: any,
  arg?: ITestStepHookParameter
) => void

export type TestStepFunction = (this: any, ...args: any[]) => any | Promise<any>

export interface IDefineStepOptions {
  timeout?: number
  wrapperOptions?: any
}

export interface IDefineTestCaseHookOptions {
  tags?: string
  timeout?: number
}

export interface IDefineTestStepHookOptions {
  tags?: string
  timeout?: number
}

export interface IDefineTestRunHookOptions {
  timeout?: number
}

export interface IParameterTypeDefinition<T> {
  name: string
  regexp: RegExp
  transformer: (...match: string[]) => T
  useForSnippets?: boolean
  preferForRegexpMatch?: boolean
}

export interface IDefineSupportCodeMethods {
  defineParameterType: (options: IParameterTypeDefinition<any>) => void
  defineStep: ((pattern: DefineStepPattern, code: TestStepFunction) => void) &
    ((
      pattern: DefineStepPattern,
      options: IDefineStepOptions,
      code: TestStepFunction
    ) => void)
  setDefaultTimeout: (milliseconds: number) => void
  setDefinitionFunctionWrapper: (fn: Function) => void
  setWorldConstructor: (fn: any) => void
  After: ((code: TestCaseHookFunction) => void) &
    ((tags: string, code: TestCaseHookFunction) => void) &
    ((options: IDefineTestCaseHookOptions, code: TestCaseHookFunction) => void)
  AfterStep: ((code: TestStepHookFunction) => void) &
    ((tags: string, code: TestStepHookFunction) => void) &
    ((options: IDefineTestStepHookOptions, code: TestStepHookFunction) => void)
  AfterAll: ((code: Function) => void) &
    ((options: IDefineTestRunHookOptions, code: Function) => void)
  Before: ((code: TestCaseHookFunction) => void) &
    ((tags: string, code: TestCaseHookFunction) => void) &
    ((options: IDefineTestCaseHookOptions, code: TestCaseHookFunction) => void)
  BeforeStep: ((code: TestStepHookFunction) => void) &
    ((tags: string, code: TestStepHookFunction) => void) &
    ((options: IDefineTestStepHookOptions, code: TestStepHookFunction) => void)
  BeforeAll: ((code: Function) => void) &
    ((options: IDefineTestRunHookOptions, code: Function) => void)
  Given: ((pattern: DefineStepPattern, code: TestStepFunction) => void) &
    ((
      pattern: DefineStepPattern,
      options: IDefineStepOptions,
      code: TestStepFunction
    ) => void)
  Then: ((pattern: DefineStepPattern, code: TestStepFunction) => void) &
    ((
      pattern: DefineStepPattern,
      options: IDefineStepOptions,
      code: TestStepFunction
    ) => void)
  When: ((pattern: DefineStepPattern, code: TestStepFunction) => void) &
    ((
      pattern: DefineStepPattern,
      options: IDefineStepOptions,
      code: TestStepFunction
    ) => void)
}

export interface ISupportCodeLibrary {
  readonly afterTestCaseHookDefinitions: TestCaseHookDefinition[]
  readonly afterTestStepHookDefinitions: TestStepHookDefinition[]
  readonly afterTestRunHookDefinitions: TestRunHookDefinition[]
  readonly beforeTestCaseHookDefinitions: TestCaseHookDefinition[]
  readonly beforeTestStepHookDefinitions: TestStepHookDefinition[]
  readonly beforeTestRunHookDefinitions: TestRunHookDefinition[]
  readonly defaultTimeout: number
  readonly stepDefinitions: StepDefinition[]
  readonly undefinedParameterTypes: messages.UndefinedParameterType[]
  readonly parameterTypeRegistry: ParameterTypeRegistry
  readonly World: any
}
