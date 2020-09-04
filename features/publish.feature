Feature: Publish reports

  Background:
    Given a file named "features/a.feature" with:
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

  @spawn
  Scenario: Report is published
    Given a report server is running on 'http://localhost:9987'
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

  @spawn
  Scenario: a banner is displayed after publication
    Given a report server is running on 'http://localhost:9987'
    When I run cucumber-js with arguments `--publish` and env `CUCUMBER_PUBLISH_URL=http://localhost:9987/api/reports`
    Then the output contains the text:
      """
      ┌──────────────────────────────────────────────────────────────────────────┐
      │ View your Cucumber Report at:                                            │
      │ https://reports.cucumber.io/reports/f318d9ec-5a3d-4727-adec-bd7b69e2edd3 │
      │                                                                          │
      │ This report will self-destruct in 24h unless it is claimed or deleted.   │
      └──────────────────────────────────────────────────────────────────────────┘
      """