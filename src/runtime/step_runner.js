import _ from 'lodash'
import Status from '../status'
import Time from '../time'
import UserCodeRunner from '../user_code_runner'
import Promise from 'bluebird'

const { beginTiming, endTiming } = Time

async function run({
  defaultTimeout,
  hookParameter,
  step,
  stepDefinition,
  world,
}) {
  beginTiming()
  let error, result, parameters

  try {
    parameters = await Promise.all(
      stepDefinition.getInvocationParameters({
        hookParameter,
        step,
        world,
      })
    )
  } catch (err) {
    error = err
  }

  if (!error) {
    const timeoutInMilliseconds =
      stepDefinition.options.timeout || defaultTimeout

    const validCodeLengths = stepDefinition.getValidCodeLengths(parameters)
    if (_.includes(validCodeLengths, stepDefinition.code.length)) {
      const data = await UserCodeRunner.run({
        argsArray: parameters,
        fn: stepDefinition.code,
        thisArg: world,
        timeoutInMilliseconds,
      })
      error = data.error
      result = data.result
    } else {
      error = stepDefinition.getInvalidCodeLengthMessage(parameters)
    }
  }

  const testStepResult = { duration: endTiming() }

  if (result === 'skipped') {
    testStepResult.status = Status.SKIPPED
  } else if (result === 'pending') {
    testStepResult.status = Status.PENDING
  } else if (error) {
    testStepResult.exception = error
    testStepResult.status = Status.FAILED
  } else {
    testStepResult.status = Status.PASSED
  }

  return testStepResult
}

export default { run }
