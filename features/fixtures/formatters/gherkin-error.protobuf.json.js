module.exports = [
  {
    source: {
      uri: 'features/a.feature',
      data:
        'Feature: a feature\n  Scenario: a scenario\n    Given a step\n    Parse Error',
      media: {
        encoding: 'UTF8',
        contentType: 'text/x.cucumber.gherkin+plain',
      },
    },
  },
]
