@flaky
Feature: Publish reports

  Background:
    Given a report server is running on 'http://localhost:9987'
    And my env includes "CUCUMBER_PUBLISH_URL=http://localhost:9987/api/reports"
    And a file named "features/a.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given a step
      """
    And a file named "features/step_definitions/steps.js" with:
      """
      const {Given} = require('@cucumber/cucumber')

      Given(/^a step$/, function() {})
      """

  @spawn
  Scenario: Report is published when --publish is specified
    When I run cucumber-js with arguments `--publish` and env ``
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
  Scenario: Report is published when CUCUMBER_PUBLISH_ENABLED is set
    When I run cucumber-js with arguments `` and env `CUCUMBER_PUBLISH_ENABLED=1`
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
  Scenario: Report is published when CUCUMBER_PUBLISH_TOKEN is set
    When I run cucumber-js with arguments `` and env `CUCUMBER_PUBLISH_TOKEN=f318d9ec-5a3d-4727-adec-bd7b69e2edd3`
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
    And the server should receive an "Authorization" header with value "Bearer f318d9ec-5a3d-4727-adec-bd7b69e2edd3"

  @spawn
  Scenario: a banner is displayed after publication
    When I run cucumber-js with arguments `--publish` and env ``
    Then the error output contains the text:
      """
      ┌──────────────────────────────────────────────────────────────────────────┐
      │ View your Cucumber Report at:                                            │
      │ https://reports.cucumber.io/reports/f318d9ec-5a3d-4727-adec-bd7b69e2edd3 │
      │                                                                          │
      │ This report will self-destruct in 24h unless it is claimed or deleted.   │
      └──────────────────────────────────────────────────────────────────────────┘
      """

  @spawn
  Scenario: results are not published due to a client error
    When I run cucumber-js with env `CUCUMBER_PUBLISH_TOKEN=keyboardcat`
    Then it passes
    And the error output contains the text:
      """
      ┌─────────────────────┐
      │ Error invalid token │
      └─────────────────────┘
      """

  @spawn
  Scenario: results are not published due to a service error
    Given report publishing is not working
    When I run cucumber-js with arguments `--publish` and env ``
    Then it passes
    And the error output does not contain the text:
      """
      Not a useful error message
      """
    And the error output contains the text:
      """
      Failed to publish report to http://localhost:9987 with status 500
      """

  @spawn
  Scenario: results are not published due to an error on uploading
    Given report uploads are not working
    When I run cucumber-js with arguments `--publish` and env ``
    Then it passes
    And the error output does not contain the text:
      """
      View your Cucumber Report at:
      """
    And the error output contains the text:
      """
      Failed to upload report to http://localhost:9987 with status 500
      """
