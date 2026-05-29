import {
  After,
  AfterAll,
  AfterStep,
  Before,
  BeforeAll,
  BeforeStep,
  type ITestCaseHookParameter,
  type ITestStepHookParameter,
} from '../'

// should allow argument-less hooks
BeforeAll(() => {})
AfterAll(() => {})
Before(() => {})
After(() => {})
BeforeStep(() => {})
AfterStep(() => {})

// should allow hook functions to be async
BeforeAll(async () => {})
AfterAll(async () => {})
Before(async () => {})
After(async () => {})
BeforeStep(async () => {})
AfterStep(async () => {})

// should allow accessing world parameters in global hooks
BeforeAll(function () {
  this.parameters.foo = 1
})
AfterAll(function () {
  this.parameters.foo = 1
})

// should allow typed arguments in hooks
Before((_param: ITestCaseHookParameter) => {})
After((_param: ITestCaseHookParameter) => {})
BeforeStep((_param: ITestStepHookParameter) => {})
AfterStep((_param: ITestStepHookParameter) => {})

// should allow an object with tags and/or name in hooks
Before({ tags: '@foo', name: 'before hook' }, () => {})
After({ tags: '@foo', name: 'after hook' }, () => {})

// should allow us to return 'skipped' from a test case hook
Before(async () => 'skipped')
After(async () => 'skipped')

// should allow named hooks
BeforeAll({ name: 'before test run' }, () => {})
AfterAll({ name: 'after test run' }, () => {})
Before({ name: 'before test case' }, () => {})
After({ name: 'after test case' }, () => {})
