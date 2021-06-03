import * as messages from '@cucumber/messages'
import TestCaseHookDefinition from '../models/test_case_hook_definition'
import TestStepHookDefinition from '../models/test_step_hook_definition'
import TestRunHookDefinition from '../models/test_run_hook_definition'
import StepDefinition from '../models/step_definition'
import { ParameterTypeRegistry } from '@cucumber/cucumber-expressions'
import { IWorld } from './world'

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

export type TestCaseHookFunction<W> = (
  this: W,
  arg?: ITestCaseHookParameter
) => any | Promise<any>

export type TestStepHookFunction<W> = (
  this: W,
  arg?: ITestStepHookParameter
) => void

export type TestStepFunction<W> = (
  this: W,
  ...args: any[]
) => any | Promise<any>

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
  defineStep: (<W = IWorld>(
    pattern: DefineStepPattern,
    code: TestStepFunction<W>
  ) => void) &
    (<W = IWorld>(
      pattern: DefineStepPattern,
      options: IDefineStepOptions,
      code: TestStepFunction<W>
    ) => void)
  setDefaultTimeout: (milliseconds: number) => void
  setDefinitionFunctionWrapper: (fn: Function) => void
  setWorldConstructor: (fn: any) => void
  After: (<W = IWorld>(code: TestCaseHookFunction<W>) => void) &
    (<W = IWorld>(tags: string, code: TestCaseHookFunction<W>) => void) &
    (<W = IWorld>(
      options: IDefineTestCaseHookOptions,
      code: TestCaseHookFunction<W>
    ) => void)
  AfterStep: (<W = IWorld>(code: TestStepHookFunction<W>) => void) &
    (<W = IWorld>(tags: string, code: TestStepHookFunction<W>) => void) &
    (<W = IWorld>(
      options: IDefineTestStepHookOptions,
      code: TestStepHookFunction<W>
    ) => void)
  AfterAll: ((code: Function) => void) &
    ((options: IDefineTestRunHookOptions, code: Function) => void)
  Before: (<W = IWorld>(code: TestCaseHookFunction<W>) => void) &
    (<W = IWorld>(tags: string, code: TestCaseHookFunction<W>) => void) &
    (<W = IWorld>(
      options: IDefineTestCaseHookOptions,
      code: TestCaseHookFunction<W>
    ) => void)
  BeforeStep: (<W = IWorld>(code: TestStepHookFunction<W>) => void) &
    (<W = IWorld>(tags: string, code: TestStepHookFunction<W>) => void) &
    (<W = IWorld>(
      options: IDefineTestStepHookOptions,
      code: TestStepHookFunction<W>
    ) => void)
  BeforeAll: ((code: Function) => void) &
    ((options: IDefineTestRunHookOptions, code: Function) => void)
  Given: (<W = IWorld>(
    pattern: DefineStepPattern,
    code: TestStepFunction<W>
  ) => void) &
    (<W = IWorld>(
      pattern: DefineStepPattern,
      options: IDefineStepOptions,
      code: TestStepFunction<W>
    ) => void)
  Then: (<W = IWorld>(
    pattern: DefineStepPattern,
    code: TestStepFunction<W>
  ) => void) &
    (<W = IWorld>(
      pattern: DefineStepPattern,
      options: IDefineStepOptions,
      code: TestStepFunction<W>
    ) => void)
  When: (<W = IWorld>(
    pattern: DefineStepPattern,
    code: TestStepFunction<W>
  ) => void) &
    (<W = IWorld>(
      pattern: DefineStepPattern,
      options: IDefineStepOptions,
      code: TestStepFunction<W>
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
