import { messages } from 'cucumber-messages'
import TestCaseHookDefinition from '../models/test_case_hook_definition'
import TestRunHookDefinition from '../models/test_run_hook_definition'
import StepDefinition from '../models/step_definition'
import { ParameterTypeRegistry } from 'cucumber-expressions'

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

export interface IParameterTypeDefinition<T> {
  name: string
  typeName?: string
  regexp: RegExp
  transformer: (...match: string[]) => T
  useForSnippets?: boolean
  preferForRegexpMatch?: boolean
}

export interface IDefineSupportCodeMethods {
  defineParameterType(options: IParameterTypeDefinition<any>): void
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
  readonly afterTestCaseHookDefinitions: TestCaseHookDefinition[]
  readonly afterTestRunHookDefinitions: TestRunHookDefinition[]
  readonly beforeTestCaseHookDefinitions: TestCaseHookDefinition[]
  readonly beforeTestRunHookDefinitions: TestRunHookDefinition[]
  readonly defaultTimeout: number
  readonly stepDefinitions: StepDefinition[]
  readonly parameterTypeRegistry: ParameterTypeRegistry
  readonly World: any
}
