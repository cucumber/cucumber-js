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

// should allow typed arguments in hooks
Before(function (param: ITestCaseHookParameter) {})
After(function (param: ITestCaseHookParameter) {})
BeforeStep(function (param: ITestStepHookParameter) {})
AfterStep(function (param: ITestStepHookParameter) {})

// should allow us to return 'skipped' from a test case hook
Before(async function () {
  return 'skipped'
})
After(async function () {
  return 'skipped'
})
