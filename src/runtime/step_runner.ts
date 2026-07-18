import { type PickleStep, type TestStepResult, TestStepResultStatus } from '@cucumber/messages'
import type { IDefinition, IGetInvocationDataResponse } from '../models/definition'
import type { ITestCaseHookParameter } from '../support_code_library_builder/types'
import UserCodeRunner from '../user_code_runner'
import { doesHaveValue, doesNotHaveValue, valueOrDefault } from '../value_checker'
import { formatError } from './format_error'
import { runInTestCaseScope } from './scope'
import { create } from './stopwatch'

export interface IRunOptions {
  defaultTimeout: number
  filterStackTraces: boolean
  hookParameter: ITestCaseHookParameter
  step: PickleStep
  stepDefinition: IDefinition
  // biome-ignore lint/suspicious/noExplicitAny: the world is an instance of a user-supplied constructor, so it really can be anything
  world: any
}

export interface RunStepResult {
  result: TestStepResult
  error?: unknown
}

export async function run({
  defaultTimeout,
  filterStackTraces,
  hookParameter,
  step,
  stepDefinition,
  world,
}: IRunOptions): Promise<RunStepResult> {
  const stopwatch = create().start()
  let error: unknown, result: unknown, invocationData: IGetInvocationDataResponse

  try {
    await runInTestCaseScope({ world }, async () => {
      invocationData = await stepDefinition.getInvocationParameters({
        hookParameter,
        step,
        world,
      })
    })
  } catch (err) {
    error = err
  }

  if (doesNotHaveValue(error)) {
    const timeoutInMilliseconds = valueOrDefault(stepDefinition.options.timeout, defaultTimeout)

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
  let status: TestStepResultStatus
  let details = {}
  if (result === 'skipped') {
    status = TestStepResultStatus.SKIPPED
  } else if (result === 'pending') {
    status = TestStepResultStatus.PENDING
  } else if (doesHaveValue(error)) {
    status = TestStepResultStatus.FAILED
  } else {
    status = TestStepResultStatus.PASSED
  }

  if (doesHaveValue(error)) {
    // UserCodeRunner normalises to Error|string, but a value thrown from
    // getInvocationParameters is unconstrained
    details = formatError(error as Error | string, filterStackTraces)
  }

  return {
    result: {
      duration,
      status,
      ...details,
    },
    error,
  }
}

export default { run }
