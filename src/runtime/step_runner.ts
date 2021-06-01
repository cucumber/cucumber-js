import _ from 'lodash'
import Time from '../time'
import UserCodeRunner from '../user_code_runner'
import * as messages from '@cucumber/messages'
import { format } from 'assertion-error-formatter'
import { ITestCaseHookParameter } from '../support_code_library_builder/types'
import { IDefinition, IGetInvocationDataResponse } from '../models/definition'
import {
  doesHaveValue,
  doesNotHaveValue,
  valueOrDefault,
} from '../value_checker'

const { beginTiming, endTiming } = Time

export interface IRunOptions {
  defaultTimeout: number
  hookParameter: ITestCaseHookParameter
  step: messages.PickleStep
  stepDefinition: IDefinition
  world: any
}

export async function run({
  defaultTimeout,
  hookParameter,
  step,
  stepDefinition,
  world,
}: IRunOptions): Promise<messages.TestStepResult> {
  beginTiming()
  let error: any, result: any, invocationData: IGetInvocationDataResponse

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

  const duration = messages.TimeConversion.millisecondsToDuration(endTiming())
  let status: messages.TestStepResultStatus
  let message: string
  if (result === 'skipped') {
    status = messages.TestStepResultStatus.SKIPPED
  } else if (result === 'pending') {
    status = messages.TestStepResultStatus.PENDING
  } else if (doesHaveValue(error)) {
    message = format(error)
    status = messages.TestStepResultStatus.FAILED
  } else {
    status = messages.TestStepResultStatus.PASSED
  }

  return {
    duration,
    status,
    message,
    willBeRetried: false,
  }
}

export default { run }
