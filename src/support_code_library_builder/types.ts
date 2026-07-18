import type {
  GherkinDocument,
  Pickle,
  PickleStep,
  TestStepResult,
  UndefinedParameterType,
} from '@cucumber/messages'
import type { JsonObject } from 'type-fest'
import type StepDefinition from '../models/step_definition'
import type TestCaseHookDefinition from '../models/test_case_hook_definition'
import type TestRunHookDefinition from '../models/test_run_hook_definition'
import type TestStepHookDefinition from '../models/test_step_hook_definition'
import type { SourcedParameterTypeRegistry } from './sourced_parameter_type_registry'
import type { IWorld } from './world'

export enum HookTarget {
  WORKER = 'WORKER',
  COORDINATOR = 'COORDINATOR',
}

export type DefineStepPattern = string | RegExp
export type ParallelAssignmentValidator = (pickle: Pickle, runningPickles: Pickle[]) => boolean
export interface ITestCaseHookParameter {
  gherkinDocument: GherkinDocument
  pickle: Pickle
  result?: TestStepResult
  // biome-ignore lint/suspicious/noExplicitAny: a thrown value really can be anything; users can narrow if they prefer
  error?: any
  willBeRetried?: boolean
  testCaseStartedId: string
}

export interface ITestStepHookParameter {
  gherkinDocument: GherkinDocument
  pickle: Pickle
  pickleStep: PickleStep
  result: TestStepResult
  // biome-ignore lint/suspicious/noExplicitAny: a thrown value really can be anything; users can narrow if they prefer
  error?: any
  testCaseStartedId: string
  testStepId: string
}

export type TestRunHookFunction = (this: {
  parameters: JsonObject
  // biome-ignore lint/suspicious/noExplicitAny: user code can return anything, or a promise of anything; we only look for the skipped/pending sentinels
}) => any | Promise<any>

export type TestCaseHookFunction<WorldType> = (
  this: WorldType,
  arg: ITestCaseHookParameter
  // biome-ignore lint/suspicious/noExplicitAny: user code can return anything, or a promise of anything; we only look for the skipped/pending sentinels
) => any | Promise<any>

export type TestStepHookFunction<WorldType> = (
  this: WorldType,
  arg: ITestStepHookParameter
  // biome-ignore lint/suspicious/noExplicitAny: user code can return anything, or a promise of anything; we only look for the skipped/pending sentinels
) => any | Promise<any>

// biome-ignore lint/suspicious/noExplicitAny: step arguments are whatever the parameter types produce, and user code can return anything
export type TestStepFunction<WorldType> = (this: WorldType, ...args: any[]) => any | Promise<any>

export interface IDefineStepOptions {
  timeout?: number
  // biome-ignore lint/suspicious/noExplicitAny: opaque to us; passed straight through to the user's definition function wrapper
  wrapperOptions?: any
}

export interface IDefineTestCaseHookOptions {
  name?: string
  tags?: string
  timeout?: number
}

export interface IDefineTestStepHookOptions {
  tags?: string
  timeout?: number
}

export interface IDefineTestRunHookOptions {
  name?: string
  on?: HookTarget
  timeout?: number
}

export interface IParameterTypeDefinition<T> {
  name: string
  regexp: readonly RegExp[] | readonly string[] | RegExp | string
  transformer?: (...match: string[]) => T
  useForSnippets?: boolean
  preferForRegexpMatch?: boolean
}

export type IDefineStep = (<WorldType = IWorld>(
  pattern: DefineStepPattern,
  code: TestStepFunction<WorldType>
) => void) &
  (<WorldType = IWorld>(
    pattern: DefineStepPattern,
    options: IDefineStepOptions,
    code: TestStepFunction<WorldType>
  ) => void)

export interface IDefineSupportCodeMethods {
  // biome-ignore lint/suspicious/noExplicitAny: the transformer returns whatever type the user's parameter type produces
  defineParameterType: (options: IParameterTypeDefinition<any>) => void
  defineStep: IDefineStep
  setDefaultTimeout: (milliseconds: number) => void
  setDefinitionFunctionWrapper: (fn: Function) => void
  setParallelCanAssign: (fn: ParallelAssignmentValidator) => void
  // biome-ignore lint/suspicious/noExplicitAny: accepts any user-supplied World constructor (a class or a plain function used with new)
  setWorldConstructor: (fn: any) => void
  After: (<WorldType = IWorld>(code: TestCaseHookFunction<WorldType>) => void) &
    (<WorldType = IWorld>(tags: string, code: TestCaseHookFunction<WorldType>) => void) &
    (<WorldType = IWorld>(
      options: IDefineTestCaseHookOptions,
      code: TestCaseHookFunction<WorldType>
    ) => void)
  AfterStep: (<WorldType = IWorld>(code: TestStepHookFunction<WorldType>) => void) &
    (<WorldType = IWorld>(tags: string, code: TestStepHookFunction<WorldType>) => void) &
    (<WorldType = IWorld>(
      options: IDefineTestStepHookOptions,
      code: TestStepHookFunction<WorldType>
    ) => void)
  AfterAll: ((code: TestRunHookFunction) => void) &
    ((options: IDefineTestRunHookOptions, code: TestRunHookFunction) => void)
  Before: (<WorldType = IWorld>(code: TestCaseHookFunction<WorldType>) => void) &
    (<WorldType = IWorld>(tags: string, code: TestCaseHookFunction<WorldType>) => void) &
    (<WorldType = IWorld>(
      options: IDefineTestCaseHookOptions,
      code: TestCaseHookFunction<WorldType>
    ) => void)
  BeforeStep: (<WorldType = IWorld>(code: TestStepHookFunction<WorldType>) => void) &
    (<WorldType = IWorld>(tags: string, code: TestStepHookFunction<WorldType>) => void) &
    (<WorldType = IWorld>(
      options: IDefineTestStepHookOptions,
      code: TestStepHookFunction<WorldType>
    ) => void)
  BeforeAll: ((code: TestRunHookFunction) => void) &
    ((options: IDefineTestRunHookOptions, code: TestRunHookFunction) => void)
  Given: IDefineStep
  Then: IDefineStep
  When: IDefineStep
}

export interface ISupportCodeCoordinates {
  requireModules: string[]
  requirePaths: string[]
  importPaths: string[]
  loaders: string[]
}

export interface CanonicalSupportCodeIds {
  stepDefinitionIds: string[]
  beforeTestCaseHookDefinitionIds: string[]
  afterTestCaseHookDefinitionIds: string[]
  beforeTestRunHookDefinitionIds: string[]
  afterTestRunHookDefinitionIds: string[]
}

export interface SupportCodeLibrary {
  readonly originalCoordinates: ISupportCodeCoordinates
  readonly afterTestCaseHookDefinitions: TestCaseHookDefinition[]
  readonly afterTestStepHookDefinitions: TestStepHookDefinition[]
  readonly afterTestRunHookDefinitions: TestRunHookDefinition[]
  readonly beforeTestCaseHookDefinitions: TestCaseHookDefinition[]
  readonly beforeTestStepHookDefinitions: TestStepHookDefinition[]
  readonly beforeTestRunHookDefinitions: TestRunHookDefinition[]
  readonly defaultTimeout: number
  readonly stepDefinitions: StepDefinition[]
  readonly undefinedParameterTypes: UndefinedParameterType[]
  readonly parameterTypeRegistry: SourcedParameterTypeRegistry
  // biome-ignore lint/suspicious/noExplicitAny: the world is a user-supplied constructor, so instances really can be anything
  readonly World: any
  readonly parallelCanAssign: ParallelAssignmentValidator
}
