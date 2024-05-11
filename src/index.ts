/**
 * User code functions and helpers
 *
 * @packageDocumentation
 * @module (root)
 * @remarks
 * These docs cover the functions and helpers for user code registration and test setup. The entry point is `@cucumber/cucumber`.
 */

import { deprecate } from 'node:util'
import * as messages from '@cucumber/messages'
import { default as _Cli } from './cli'
import * as cliHelpers from './cli/helpers'
import * as formatterHelpers from './formatter/helpers'
import { default as _PickleFilter } from './pickle_filter'
import * as parallelCanAssignHelpers from './support_code_library_builder/parallel_can_assign_helpers'
import { default as _Runtime } from './runtime'
import supportCodeLibraryBuilder from './support_code_library_builder'
import { version as _version } from './version'

// type version as string to avoid tripping api-extractor every release
export const version = _version as string

// Top level
export { default as supportCodeLibraryBuilder } from './support_code_library_builder'
export { default as DataTable } from './models/data_table'
export { default as TestCaseHookDefinition } from './models/test_case_hook_definition'

// Formatters
export { default as Formatter, IFormatterOptions } from './formatter'
export { default as FormatterBuilder } from './formatter/builder'
export { default as JsonFormatter } from './formatter/json_formatter'
export { default as ProgressFormatter } from './formatter/progress_formatter'
export { default as RerunFormatter } from './formatter/rerun_formatter'
export { default as SnippetsFormatter } from './formatter/snippets_formatter'
export { default as SummaryFormatter } from './formatter/summary_formatter'
export { default as UsageFormatter } from './formatter/usage_formatter'
export { default as UsageJsonFormatter } from './formatter/usage_json_formatter'
export { formatterHelpers }

// Support Code Functions
const { methods } = supportCodeLibraryBuilder
export const After = methods.After
export const AfterAll = methods.AfterAll
export const AfterStep = methods.AfterStep
export const Before = methods.Before
export const BeforeAll = methods.BeforeAll
export const BeforeStep = methods.BeforeStep
export const defineStep = methods.defineStep
export const defineParameterType = methods.defineParameterType
export const Given = methods.Given
export const setDefaultTimeout = methods.setDefaultTimeout
export const setDefinitionFunctionWrapper = methods.setDefinitionFunctionWrapper
export const setWorldConstructor = methods.setWorldConstructor
export const setParallelCanAssign = methods.setParallelCanAssign
export const Then = methods.Then
export const When = methods.When
export {
  default as World,
  IWorld,
  IWorldOptions,
} from './support_code_library_builder/world'
export { IContext } from './support_code_library_builder/context'
export { worldProxy as world, contextProxy as context } from './runtime/scope'
export { parallelCanAssignHelpers }

export {
  ITestCaseHookParameter,
  ITestStepHookParameter,
} from './support_code_library_builder/types'
export const Status = messages.TestStepResultStatus

// Time helpers
export { wrapPromiseWithTimeout } from './time'

// Deprecated
/**
 * @deprecated use `runCucumber` instead; see https://github.com/cucumber/cucumber-js/blob/main/docs/deprecations.md
 */
export const Cli = deprecate(
  _Cli,
  '`Cli` is deprecated, use `runCucumber` instead; see https://github.com/cucumber/cucumber-js/blob/main/docs/deprecations.md'
)
/**
 * @deprecated use `loadSources` instead; see https://github.com/cucumber/cucumber-js/blob/main/docs/deprecations.md
 */
export const parseGherkinMessageStream = deprecate(
  cliHelpers.parseGherkinMessageStream,
  '`parseGherkinMessageStream` is deprecated, use `loadSources` instead; see https://github.com/cucumber/cucumber-js/blob/main/docs/deprecations.md'
)
/**
 * @deprecated use `loadSources` instead; see https://github.com/cucumber/cucumber-js/blob/main/docs/deprecations.md
 */
export const PickleFilter = deprecate(
  _PickleFilter,
  '`PickleFilter` is deprecated, use `loadSources` instead; see https://github.com/cucumber/cucumber-js/blob/main/docs/deprecations.md'
)
/**
 * @deprecated use `runCucumber` instead; see https://github.com/cucumber/cucumber-js/blob/main/docs/deprecations.md
 */
export const Runtime = deprecate(
  _Runtime,
  '`Runtime` is deprecated, use `runCucumber` instead; see https://github.com/cucumber/cucumber-js/blob/main/docs/deprecations.md'
)
export { INewRuntimeOptions, IRuntimeOptions } from './runtime'
