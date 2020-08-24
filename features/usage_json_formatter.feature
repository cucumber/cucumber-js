Feature: usage json formatter

  As a developer
  I want a formatter which just outputs the full step definition usage in a parsable format
  So I can feed the usage data to other programs


  Scenario:
    Given a file named "features/a.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given step A
          And step A
          When step B
          Then step C
      """
    And a file named "features/step_definitions/steps.js" with:
      """
      const {When} = require('@cucumber/cucumber')

      When('step A', function() {});
      When('step B', function() {});
      When('step C', function() {});
      When(/step D/, function() {});
      """
    When I run cucumber-js with `--format usage-json`
    Then it outputs the usage data:
      | PATTERN | PATTERN_TYPE       | URI                                | LINE | NUMBER OF MATCHES |
      | step A  | CucumberExpression | features/step_definitions/steps.js | 3    | 2                 |
      | step B  | CucumberExpression | features/step_definitions/steps.js | 4    | 1                 |
      | step C  | CucumberExpression | features/step_definitions/steps.js | 5    | 1                 |
      | step D  | RegularExpression  | features/step_definitions/steps.js | 6    | 0                 |
