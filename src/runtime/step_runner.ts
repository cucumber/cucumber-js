import _ from 'lodash'
import Status from '../status'
import { StartStopwatch } from '../time'
import UserCodeRunner from '../user_code_runner'
import { messages } from '@cucumber/messages'
import { format } from 'assertion-error-formatter'
import { ITestCaseHookParameter } from '../support_code_library_builder/types'
import { IDefinition, IGetInvocationDataResponse } from '../models/definition'
import {
  doesHaveValue,
  doesNotHaveValue,
  valueOrDefault,
} from '../value_checker'

// const { beginTiming, endTiming } = Time

export interface IRunOptions {
  defaultTimeout: number
  startStopwatch: StartStopwatch
  hookParameter: ITestCaseHookParameter
  step: messages.Pickle.IPickleStep
  stepDefinition: IDefinition
  world: any
}

export async function run({
  defaultTimeout,
  startStopwatch,
  hookParameter,
  step,
  stepDefinition,
  world,
}: IRunOptions): Promise<messages.TestStepFinished.ITestStepResult> {
  const stopStopwatch = startStopwatch()
  let error: any,
    result: messages.TestStepFinished.ITestStepResult,
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

  if (doesNotHaveValue(error)) {
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

  const testStepResult = messages.TestStepFinished.TestStepResult.fromObject({
    duration: stopStopwatch(),
  })

  if (result === 'skipped') {
    testStepResult.status = Status.SKIPPED
  } else if (result === 'pending') {
    testStepResult.status = Status.PENDING
  } else if (doesHaveValue(error)) {
    testStepResult.message = format(error)
    testStepResult.status = Status.FAILED
  } else {
    testStepResult.status = Status.PASSED
  }

  return testStepResult
}

export default { run }
