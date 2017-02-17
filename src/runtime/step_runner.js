import _ from 'lodash'
import Status from '../status'
import StepResult from '../models/step_result'
import Time from '../time'
import UserCodeRunner from '../user_code_runner'

const {beginTiming, endTiming} = Time

async function run({attachmentManager, defaultTimeout, scenarioResult, step, stepDefinition, parameterRegistry, world}) {
  beginTiming()
  const parameters = stepDefinition.getInvocationParameters({scenarioResult, step, parameterRegistry})
  const timeoutInMilliseconds = stepDefinition.options.timeout || defaultTimeout

  let error, result
  const validCodeLengths = stepDefinition.getValidCodeLengths(parameters)
  if (_.includes(validCodeLengths, stepDefinition.code.length)) {
    const data = await UserCodeRunner.run({
      argsArray: parameters,
      fn: stepDefinition.code,
      thisArg: world,
      timeoutInMilliseconds
    })
    error = data.error
    result = data.result
  } else {
    error = stepDefinition.getInvalidCodeLengthMessage(parameters)
  }

  const attachments = attachmentManager.getAll()
  attachmentManager.reset()

  const stepResultData = {
    attachments,
    duration: endTiming(),
    step,
    stepDefinition
  }

  if (result === 'pending') {
    stepResultData.status = Status.PENDING
  } else if (error) {
    stepResultData.failureException = error
    stepResultData.status = Status.FAILED
  } else {
    stepResultData.status = Status.PASSED
  }

  return new StepResult(stepResultData)
}

export default {run}
