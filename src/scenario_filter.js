import _ from "lodash";
import path from "path";
import TagExpressionParser from "cucumber-tag-expressions/lib/tag_expression_parser";

const FEATURE_LINENUM_REGEXP = /^(.*?)((?::[\d]+)+)?$/;
const tagExpressionParser = new TagExpressionParser();

export default class ScenarioFilter {
  constructor({ cwd, featurePaths, names, tagExpression }) {
    this.cwd = cwd;
    this.featureUriToLinesMapping = this.getFeatureUriToLinesMapping(
      featurePaths || []
    );
    this.names = names || [];
    if (tagExpression) {
      this.tagExpressionNode = tagExpressionParser.parse(tagExpression || "");
    }
  }

  getFeatureUriToLinesMapping(featurePaths) {
    const mapping = {};
    featurePaths.forEach(featurePath => {
      const match = FEATURE_LINENUM_REGEXP.exec(featurePath);
      if (match) {
        const uri = path.resolve(this.cwd, match[1]);
        const linesExpression = match[2];
        if (linesExpression) {
          if (!mapping[uri]) {
            mapping[uri] = [];
          }
          linesExpression.slice(1).split(":").forEach(function(line) {
            mapping[uri].push(parseInt(line));
          });
        }
      }
    });
    return mapping;
  }

  matches(scenario) {
    return (
      this.matchesAnyLine(scenario) &&
      this.matchesAnyName(scenario) &&
      this.matchesAllTagExpressions(scenario)
    );
  }

  matchesAnyLine(scenario) {
    const lines = this.featureUriToLinesMapping[scenario.uri];
    if (lines) {
      return _.size(_.intersection(lines, scenario.lines)) > 0;
    } else {
      return true;
    }
  }

  matchesAnyName(scenario) {
    if (this.names.length === 0) {
      return true;
    }
    const scenarioName = scenario.name;
    return _.some(this.names, function(name) {
      return scenarioName.match(name);
    });
  }

  matchesAllTagExpressions(scenario) {
    if (!this.tagExpressionNode) {
      return true;
    }
    const scenarioTags = scenario.tags.map(t => t.name);
    return this.tagExpressionNode.evaluate(scenarioTags);
  }
}
