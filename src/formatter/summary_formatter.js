import _ from "lodash";
import { formatIssue, formatSummary } from "./helpers";
import Formatter from "./";
import Status from "../status";

export default class SummaryFormatter extends Formatter {
  handleFeaturesResult(featuresResult) {
    const failures = featuresResult.stepResults.filter(function(stepResult) {
      return _.includes([Status.AMBIGUOUS, Status.FAILED], stepResult.status);
    });
    if (failures.length > 0) {
      this.logIssues({ stepResults: failures, title: "Failures" });
    }
    const warnings = featuresResult.stepResults.filter(function(stepResult) {
      return _.includes([Status.PENDING, Status.UNDEFINED], stepResult.status);
    });
    if (warnings.length > 0) {
      this.logIssues({ stepResults: warnings, title: "Warnings" });
    }
    this.log(
      formatSummary({
        colorFns: this.colorFns,
        featuresResult
      })
    );
  }

  logIssues({ stepResults, title }) {
    this.log(title + ":\n\n");
    stepResults.forEach((stepResult, index) => {
      this.log(
        formatIssue({
          colorFns: this.colorFns,
          cwd: this.cwd,
          number: index + 1,
          snippetBuilder: this.snippetBuilder,
          stepResult
        })
      );
    });
  }
}
