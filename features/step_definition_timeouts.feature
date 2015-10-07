Feature: Step definition timeouts

  Background:
    Given a file named "features/step_definitions/cucumber_steps.js" with:
      """
      module.exports = function() {
        this.setDefaultTimeout(500);

        this.Given(/^a callback step runs slowly$/, function(callback) {
          setTimeout(callback, 1000);
        });

        this.Given(/^a callback step runs slowly with an increased timeout$/, {timeout: 1500}, function(callback) {
          setTimeout(callback, 1000);
        });

        this.Given(/^a promise step runs slowly$/, function() {
          return { then: function (ok, ko) { setTimeout(ok, 1000); } };
        });

        this.Given(/^a promise step runs slowly with an increased timeout$/, {timeout: 1500}, function() {
          return { then: function (ok, ko) { setTimeout(ok, 1000); } };
        });
      };
      """

  Scenario Outline: slow steps timeout
    Given a file named "features/a.feature" with:
      """
      Feature:
        Scenario:
          When a <TYPE> step runs slowly
      """
    When I run cucumber.js with `--strict`
    Then the output contains the text:
      """
      Error: Step timed out after 500 milliseconds
      """
    And the exit status should be 1

    Examples:
      | TYPE     |
      | callback |
      | promise  |


  Scenario Outline: slow steps can increase their timeout
    Given a file named "features/a.feature" with:
      """
      Feature:
        Scenario:
          When a <TYPE> step runs slowly with an increased timeout
      """
    When I run cucumber.js with `--strict`
    Then the exit status should be 0

    Examples:
      | TYPE     |
      | callback |
      | promise  |


  Scenario Outline: changing step timeouts does not effect other steps
    Given a file named "features/a.feature" with:
      """
      Feature:
        Scenario:
          When a <TYPE> step runs slowly with an increased timeout
          And a <TYPE> step runs slowly
      """
    When I run cucumber.js with `--strict`
    Then the output contains the text:
      """
      Error: Step timed out after 500 milliseconds
      """
    Then the exit status should be 1

    Examples:
      | TYPE     |
      | callback |
      | promise  |
