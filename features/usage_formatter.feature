Feature: snippets formatter

  As a developer with slow or user steps
  I want a formatter which just outputs the step definition usage
  So I know where my bottelnecks are and what outdated step definitions I can remove


  Scenario:
    Given a file named "features/a.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given step A
          When step B
          And slow step B
          Then step C
      """
    And a file named "features/step_definitions/steps.js" with:
      """
      import {defineSupportCode} from 'cucumber'

      defineSupportCode(({When}) => {
        When('step A', function(callback) { setTimeout(callback, 100) });
        When(/^(slow )?step B$/, function(slow, callback) {
          if (slow) {
            setTimeout(callback, 100)
          } else {
            callback()
          }
        });
        When('step C', function(callback) { setTimeout(callback, 10) });
        When('step D', function() {});
      })
      """
    When I run cucumber-js with `--format usage`
    Then the usage output is:
      | PATTERN | NUMBER OF MATCHES | MEAN DURATION |
      | step A  | 1                 | 100           |
      | step B  | 2                 | 50            |
      | step C  | 1                 | 10            |
      | step D  | 0                 |               |
