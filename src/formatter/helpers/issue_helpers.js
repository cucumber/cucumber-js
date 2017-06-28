import { formatLocation } from "./location_helpers";
import { formatError } from "./error_helpers";
import indentString from "indent-string";
import Status from "../../status";
import Table from "cli-table";

export function formatIssue({
  colorFns,
  cwd,
  number,
  snippetBuilder,
  stepResult
}) {
  const message = getStepResultMessage({
    colorFns,
    cwd,
    snippetBuilder,
    stepResult
  });
  const prefix = number + ") ";
  const { step } = stepResult;
  const { scenario } = step;
  let text = prefix;

  if (scenario) {
    const scenarioLocation = formatLocation(cwd, scenario);
    text +=
      "Scenario: " +
      colorFns.bold(scenario.name) +
      " - " +
      colorFns.location(scenarioLocation);
  } else {
    text += "Background:";
  }
  text += "\n";

  let stepText = "Step: " + colorFns.bold(step.keyword + (step.name || ""));
  if (step.uri) {
    const stepLocation = formatLocation(cwd, step);
    stepText += " - " + colorFns.location(stepLocation);
  }
  text += indentString(stepText, prefix.length) + "\n";

  const { stepDefinition } = stepResult;
  if (stepDefinition) {
    const stepDefinitionLocation = formatLocation(cwd, stepDefinition);
    const stepDefinitionLine =
      "Step Definition: " + colorFns.location(stepDefinitionLocation);
    text += indentString(stepDefinitionLine, prefix.length) + "\n";
  }

  text += indentString("Message:", prefix.length) + "\n";
  text += indentString(message, prefix.length + 2) + "\n\n";
  return text;
}

function getAmbiguousStepResultMessage({ colorFns, cwd, stepResult }) {
  const { ambiguousStepDefinitions } = stepResult;
  const table = new Table({
    chars: {
      bottom: "",
      "bottom-left": "",
      "bottom-mid": "",
      "bottom-right": "",
      left: "",
      "left-mid": "",
      mid: "",
      "mid-mid": "",
      middle: " - ",
      right: "",
      "right-mid": "",
      top: "",
      "top-left": "",
      "top-mid": "",
      "top-right": ""
    },
    style: {
      border: [],
      "padding-left": 0,
      "padding-right": 0
    }
  });
  table.push.apply(
    table,
    ambiguousStepDefinitions.map(stepDefinition => {
      const pattern = stepDefinition.pattern.toString();
      return [pattern, formatLocation(cwd, stepDefinition)];
    })
  );
  const message =
    "Multiple step definitions match:" +
    "\n" +
    indentString(table.toString(), 2);
  return colorFns.ambiguous(message);
}

function getFailedStepResultMessage({ colorFns, stepResult }) {
  const { failureException } = stepResult;
  return formatError(failureException, colorFns);
}

function getPendingStepResultMessage({ colorFns }) {
  return colorFns.pending("Pending");
}

function getStepResultMessage({ colorFns, cwd, snippetBuilder, stepResult }) {
  switch (stepResult.status) {
    case Status.AMBIGUOUS:
      return getAmbiguousStepResultMessage({ colorFns, cwd, stepResult });
    case Status.FAILED:
      return getFailedStepResultMessage({ colorFns, stepResult });
    case Status.UNDEFINED:
      return getUndefinedStepResultMessage({
        colorFns,
        snippetBuilder,
        stepResult
      });
    case Status.PENDING:
      return getPendingStepResultMessage({ colorFns });
  }
}

function getUndefinedStepResultMessage({
  colorFns,
  snippetBuilder,
  stepResult
}) {
  const { step } = stepResult;
  const snippet = snippetBuilder.build(step);
  const message =
    "Undefined. Implement with the following snippet:" +
    "\n\n" +
    indentString(snippet, 2);
  return colorFns.undefined(message);
}
