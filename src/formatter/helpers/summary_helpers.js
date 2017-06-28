import _ from "lodash";
import Duration from "duration";
import Hook from "../../models/hook";
import Status from "../../status";

const STATUS_REPORT_ORDER = [
  Status.FAILED,
  Status.AMBIGUOUS,
  Status.UNDEFINED,
  Status.PENDING,
  Status.SKIPPED,
  Status.PASSED
];

export function formatSummary({ colorFns, featuresResult }) {
  const scenarioSummary = getCountSummary({
    colorFns,
    objects: featuresResult.scenarioResults,
    type: "scenario"
  });
  const stepSummary = getCountSummary({
    colorFns,
    objects: featuresResult.stepResults.filter(
      ({ step }) => !(step instanceof Hook)
    ),
    type: "step"
  });
  const durationSummary = getDuration(featuresResult);
  return [scenarioSummary, stepSummary, durationSummary].join("\n");
}

function getCountSummary({ colorFns, objects, type }) {
  const counts = _.chain(objects).groupBy("status").mapValues("length").value();
  const total = _.reduce(counts, (memo, value) => memo + value) || 0;
  let text = total + " " + type + (total === 1 ? "" : "s");
  if (total > 0) {
    const details = [];
    STATUS_REPORT_ORDER.forEach(status => {
      if (counts[status] > 0) {
        details.push(colorFns[status](counts[status] + " " + status));
      }
    });
    text += " (" + details.join(", ") + ")";
  }
  return text;
}

function getDuration(featuresResult) {
  const milliseconds = featuresResult.duration;
  const start = new Date(0);
  const end = new Date(milliseconds);
  const duration = new Duration(start, end);

  return (
    duration.minutes +
    "m" +
    duration.toString("%S") +
    "." +
    duration.toString("%L") +
    "s" +
    "\n"
  );
}
