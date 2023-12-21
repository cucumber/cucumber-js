import {
  After,
  AfterAll,
  AfterStep,
  Before,
  BeforeAll,
  BeforeStep,
  ITestCaseHookParameter,
  ITestStepHookParameter,
} from '../'

// should allow argument-less hooks
BeforeAll(function () {})
AfterAll(function () {})
Before(function () {})
After(function () {})
BeforeStep(function () {})
AfterStep(function () {})

// should allow hook functions to be async
BeforeAll(async function () {})
AfterAll(async function () {})
Before(async function () {})
After(async function () {})
BeforeStep(async function () {})
AfterStep(async function () {})

// should allow accessing world parameters in global hooks
BeforeAll(function () {
  this.parameters.foo = 1
})
AfterAll(function () {
  this.parameters.foo = 1
})

// should allow typed arguments in hooks
Before(function (param: ITestCaseHookParameter) {})
After(function (param: ITestCaseHookParameter) {})
BeforeStep(function (param: ITestStepHookParameter) {})
AfterStep(function (param: ITestStepHookParameter) {})

// should allow an object with tags and/or name in hooks
Before({ tags: '@foo', name: 'before hook' }, function () {})
After({ tags: '@foo', name: 'after hook' }, function () {})

// should allow us to return 'skipped' from a test case hook
Before(async function () {
  return 'skipped'
})
After(async function () {
  return 'skipped'
})
