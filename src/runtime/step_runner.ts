import * as messages from '@cucumber/messages'
import UserCodeRunner from '../user_code_runner'
import { ITestCaseHookParameter } from '../support_code_library_builder/types'
import { IDefinition, IGetInvocationDataResponse } from '../models/definition'
import {
  doesHaveValue,
  doesNotHaveValue,
  valueOrDefault,
} from '../value_checker'
import { runInTestCaseScope } from './scope'
import { create } from './stopwatch'
import { formatError } from './format_error'

export interface IRunOptions {
  defaultTimeout: number
  filterStackTraces: boolean
  hookParameter: ITestCaseHookParameter
  step: messages.PickleStep
  stepDefinition: IDefinition
  world: any
}

export async function run({
  defaultTimeout,
  filterStackTraces,
  hookParameter,
  step,
  stepDefinition,
  world,
}: IRunOptions): Promise<messages.TestStepResult> {
  const stopwatch = create().start()
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

    if (invocationData.validCodeLengths.includes(stepDefinition.code.length)) {
      const data = await runInTestCaseScope({ world }, async () =>
        UserCodeRunner.run({
          argsArray: invocationData.parameters,
          fn: stepDefinition.code,
          thisArg: world,
          timeoutInMilliseconds,
        })
      )
      error = data.error
      result = data.result
    } else {
      error = invocationData.getInvalidCodeLengthMessage()
    }
  }

  const duration = stopwatch.stop().duration()
  let status: messages.TestStepResultStatus
  let details = {}
  if (result === 'skipped') {
    status = messages.TestStepResultStatus.SKIPPED
  } else if (result === 'pending') {
    status = messages.TestStepResultStatus.PENDING
  } else if (doesHaveValue(error)) {
    status = messages.TestStepResultStatus.FAILED
  } else {
    status = messages.TestStepResultStatus.PASSED
  }

  if (doesHaveValue(error)) {
    details = formatError(error, filterStackTraces)
  }

  return {
    duration,
    status,
    ...details,
  }
}

export default { run }
