module.exports = [
  {
    type: 'source',
    uri: 'features/a.feature',
    data:
      'Feature: a feature\n  Scenario: a scenario\n    Given a step\n    Examples:\n      | a | b |',
    media: { encoding: 'utf-8', type: 'text/x.cucumber.gherkin+plain' },
  },
  {
    type: 'attachment',
    source: { uri: 'features/a.feature', start: { line: 4, column: 5 } },
    data:
      "(4:5): expected: #EOF, #TableRow, #DocStringSeparator, #StepLine, #TagLine, #ScenarioLine, #ScenarioOutlineLine, #Comment, #Empty, got 'Examples:'",
    media: { encoding: 'utf-8', type: 'text/x.cucumber.stacktrace+plain' },
  },
]
