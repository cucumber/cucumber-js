Feature: snippets formatter

  As a developer with slow or unused steps
  I want a formatter which just outputs the step definition usage
  So I know where my bottelnecks are and what step definitions I can remove


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
      import {defineSupportCode} from 'cucumber'

      defineSupportCode(({When}) => {
        When('step A', function() {});
        When('step B', function() {});
        When('step C', function() {});
        When('step D', function() {});
      })
      """
    When I run cucumber-js with `--format usage-json`
    Then it outputs the usage data:
      | PATTERN | URI                                | LINE | NUMBER OF MATCHES |
      | step A  | features/step_definitions/steps.js | 4    | 2                 |
      | step B  | features/step_definitions/steps.js | 5    | 1                 |
      | step C  | features/step_definitions/steps.js | 6    | 1                 |
      | step D  | features/step_definitions/steps.js | 7    | 0                 |
