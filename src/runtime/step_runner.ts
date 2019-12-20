import _ from 'lodash'
import Status from '../status'
import Time, { millisecondsToDuration } from '../time'
import UserCodeRunner from '../user_code_runner'
import { messages } from 'cucumber-messages'
import { format } from 'assertion-error-formatter'
import { ITestCaseHookParameter } from '../support_code_library_builder'
import { IDefinition, IGetInvocationDataResponse } from '../models/definition'
import { valueOrDefault } from '../value_checker'

const { beginTiming, endTiming } = Time

export interface IRunOptions {
  defaultTimeout: number
  hookParameter: ITestCaseHookParameter
  step: messages.Pickle.IPickleStep
  stepDefinition: IDefinition
  world: any
}

export async function run({
  defaultTimeout,
  hookParameter,
  step,
  stepDefinition,
  world,
}: IRunOptions) {
  beginTiming()
  let error: any,
    result: messages.ITestResult,
    invocationData: IGetInvocationDataResponse

  try {
    invocationData = await stepDefinition.getInvocationParameters({
      hookParameter,
      step,
      world,
    })
  } catch (err) {
    error = err
  }

  if (!error) {
    const timeoutInMilliseconds = valueOrDefault(
      stepDefinition.options.timeout,
      defaultTimeout
    )

    if (
      _.includes(invocationData.validCodeLengths, stepDefinition.code.length)
    ) {
      const data = await UserCodeRunner.run({
        argsArray: invocationData.parameters,
        fn: stepDefinition.code,
        thisArg: world,
        timeoutInMilliseconds,
      })
      error = data.error
      result = data.result
    } else {
      error = invocationData.getInvalidCodeLengthMessage()
    }
  }

  const testStepResult = messages.TestResult.fromObject({
    duration: millisecondsToDuration(endTiming()),
  })

  if (result === 'skipped') {
    testStepResult.status = Status.SKIPPED
  } else if (result === 'pending') {
    testStepResult.status = Status.PENDING
  } else if (error) {
    testStepResult.message = format(error)
    testStepResult.status = Status.FAILED
  } else {
    testStepResult.status = Status.PASSED
  }

  return testStepResult
}

export default { run }
