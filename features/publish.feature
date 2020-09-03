Feature: Publish reports

  @spawn
  Scenario: Report is published
    Given a report server is running on 'http://localhost:9987'
    And a file named "features/a.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given a step
      """
    And a file named "features/step_definitions/steps.js" with:
      """
      const {Given} = require('cucumber')

      Given(/^a step$/, function() {})
      """
    When I run cucumber-js with arguments `--publish` and env `CUCUMBER_PUBLISH_URL=http://localhost:9987/api/reports`
    Then it passes
    And the server should receive the following message types:
      | meta             |
      | source           |
      | gherkinDocument  |
      | pickle           |
      | stepDefinition   |
      | testRunStarted   |
      | testCase         |
      | testCaseStarted  |
      | testStepStarted  |
      | testStepFinished |
      | testCaseFinished |
      | testRunFinished  |