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
  Scenario: when results are not published, a banner explains how to publish
    When I run cucumber-js
    Then the error output contains the text:
      """
      ┌──────────────────────────────────────────────────────────────────────────────┐
      │ Share your Cucumber Report with your team at https://reports.cucumber.io     │
      │                                                                              │
      │ Command line option:    --publish                                            │
      │ Environment variable:   CUCUMBER_PUBLISH_ENABLED=true                        │
      │                                                                              │
      │ More information at https://cucumber.io/docs/cucumber/environment-variables/ │
      │                                                                              │
      │ To disable this message, add this to your ./cucumber.js:                     │
      │ module.exports = { default: '--publish-quiet' }                              │
      └──────────────────────────────────────────────────────────────────────────────┘
      """

  @spawn
  Scenario: when results are not published due to an error raised by the server, the banner is displayed
    When I run cucumber-js with env `CUCUMBER_PUBLISH_TOKEN=keyboardcat`
    Then it fails
    And the error output contains the text:
      """
      ┌─────────────────────┐
      │ Error invalid token │
      └─────────────────────┘

      Unexpected http status 401 from GET http://localhost:9987
      """

  @spawn
  Scenario: the publication banner is not shown when publication is done
    When I run cucumber-js with arguments `<args>` and env `<env>`
    Then the error output does not contain the text:
      """
      Share your Cucumber Report with your team at https://reports.cucumber.io
      """

  Examples:
    | args      | env                                                         |
    | --publish |                                                             |
    |           | CUCUMBER_PUBLISH_ENABLED=true                               |
    |           | CUCUMBER_PUBLISH_TOKEN=f318d9ec-5a3d-4727-adec-bd7b69e2edd3 |

  @spawn
  Scenario: the publication banner is not shown when publication is disabled
    When I run cucumber-js with arguments `<args>` and env `<env>`
    Then the error output does not contain the text:
      """
      Share your Cucumber Report with your team at https://reports.cucumber.io
      """

  Examples:
    | args            | env                         |
    | --publish-quiet |                             |
    |                 | CUCUMBER_PUBLISH_QUIET=true |
