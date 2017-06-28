import _ from "lodash";
import Status from "../status";

export default class FeaturesResult {
  constructor(strict) {
    this.duration = 0;
    this.scenarioResults = [];
    this.success = true;
    this.stepResults = [];
    this.strict = strict;
  }

  witnessScenarioResult(scenarioResult) {
    const { duration, status, stepResults } = scenarioResult;
    this.duration += duration;
    this.scenarioResults.push(scenarioResult);
    this.stepResults = this.stepResults.concat(stepResults);
    if (_.includes([Status.AMBIGUOUS, Status.FAILED], status)) {
      this.success = false;
    }
    if (this.strict && _.includes([Status.PENDING, Status.UNDEFINED], status)) {
      this.success = false;
    }
  }
}
