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
      const {Given} = require('@cucumber/cucumber')

      Given(/^a step$/, function() {})
      """

  @spawn
  Scenario: Report is published when --publish is specified
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
  Scenario: Report is published when CUCUMBER_PUBLISH_ENABLED is set
    Given a report server is running on 'http://localhost:9987'
    When I run cucumber-js with arguments `` and env `CUCUMBER_PUBLISH_ENABLED=1 CUCUMBER_PUBLISH_URL=http://localhost:9987/api/reports`
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
    Given a report server is running on 'http://localhost:9987'
    When I run cucumber-js with arguments `` and env `CUCUMBER_PUBLISH_TOKEN=keyboardcat CUCUMBER_PUBLISH_URL=http://localhost:9987/api/reports`
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
    And the server should receive an "Authorization" header with value "Bearer keyboardcat"

  @spawn
  Scenario: a banner is displayed after publication
    Given a report server is running on 'http://localhost:9987'
    When I run cucumber-js with arguments `--publish` and env `CUCUMBER_PUBLISH_URL=http://localhost:9987/api/reports`
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
      ┌──────────────────────────────────────────────────────────────────────────┐
      │ Share your Cucumber Report with your team at https://reports.cucumber.io │
      │                                                                          │
      │ Command line option:    --publish                                        │
      │ Environment variable:   CUCUMBER_PUBLISH_ENABLED=true                    │
      │ cucumber.yml:           default: --publish                               │
      │                                                                          │
      │ More information at https://reports.cucumber.io/docs/cucumber-js         │
      │                                                                          │
      │ To disable this message, specify CUCUMBER_PUBLISH_QUIET=true or use the  │
      │ --publish-quiet option. You can also add this to your cucumber.yml:      │
      │ default: --publish-quiet                                                 │
      └──────────────────────────────────────────────────────────────────────────┘
      """

  @spawn
  Scenario: the publication banner is not shown when publication is done
    When I run cucumber-js with arguments `<args>` and env `<env>`
    Then the error output does not contain the text:
      """
      Share your Cucumber Report with your team at https://reports.cucumber.io
      """

  Examples:
    | args      | env                           |
    | --publish |                               |
    |           | CUCUMBER_PUBLISH_ENABLED=true |
    |           | CUCUMBER_PUBLISH_TOKEN=123456 |

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