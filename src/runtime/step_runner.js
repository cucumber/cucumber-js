import _ from 'lodash'
import AttachmentManager from './attachment_manager'
import Status from '../status'
import StepResult from '../models/step_result'
import Time from '../time'
import UserCodeRunner from '../user_code_runner'

const {beginTiming, endTiming} = Time

async function run({defaultTimeout, scenarioResult, step, stepDefinition, transformLookup, world}) {
  beginTiming()
  const parameters = stepDefinition.getInvocationParameters({scenarioResult, step, transformLookup})
  const timeoutInMilliseconds = stepDefinition.options.timeout || defaultTimeout
  const attachmentManager = new AttachmentManager()
  world.attach = ::attachmentManager.create

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

  const stepResultData = {
    attachments: attachmentManager.getAll(),
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
