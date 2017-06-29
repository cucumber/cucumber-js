import Status, { addStatusPredicates } from '../status'

export default class ScenarioResult {
  constructor(scenario, status) {
    this.duration = 0
    this.failureException = null
    this.scenario = scenario
    this.status = status || Status.PASSED
    this.stepResults = []
  }

  shouldUpdateStatus(stepResultStatus) {
    switch (stepResultStatus) {
      case Status.FAILED:
        return true
      case Status.AMBIGUOUS:
      case Status.PENDING:
      case Status.SKIPPED:
      case Status.UNDEFINED:
        return this.status === Status.PASSED
      default:
        return false
    }
  }

  witnessStepResult(stepResult) {
    const { duration, failureException, status } = stepResult
    if (duration) {
      this.duration += duration
    }
    if (status === Status.FAILED) {
      this.failureException = failureException
    }
    if (this.shouldUpdateStatus(status)) {
      this.status = status
    }
    this.stepResults.push(stepResult)
  }
}

addStatusPredicates(ScenarioResult.prototype)
