import _ from "lodash";
import Formatter from "./";
import path from "path";
import Status from "../status";

export default class RerunFormatter extends Formatter {
  handleFeaturesResult(featuresResult) {
    const mapping = {};
    featuresResult.scenarioResults.forEach(scenarioResult => {
      if (scenarioResult.status !== Status.PASSED) {
        const scenario = scenarioResult.scenario;
        const relativeUri = path.relative(this.cwd, scenario.uri);
        if (!mapping[relativeUri]) {
          mapping[relativeUri] = [];
        }
        mapping[relativeUri].push(scenario.line);
      }
    });
    const text = _.map(mapping, (lines, relativeUri) => {
      return relativeUri + ":" + lines.join(":");
    }).join("\n");
    this.log(text);
  }
}
