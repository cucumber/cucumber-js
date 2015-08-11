Feature: Step definition timeouts

  Background:
    Given a file named "features/step_definitions/cucumber_steps.js" with:
      """
      var cucumberSteps = function() {
        this.Given(/^a callback step runs slowly$/, function(callback) {
          setTimeout(callback, 12000);
        });
        this.Given(/^a callback step runs slowly with an increased timeout$/, function(callback) {
          this.timeout(14000);
          setTimeout(callback, 12000);
        });
        this.Given(/^a promise step runs slowly$/, function() {
          return { then: function (ok, ko) { setTimeout(ok, 12000); } };
        });
        this.Given(/^a promise step runs slowly with an increased timeout$/, function() {
          this.timeout(14000);
          return { then: function (ok, ko) { setTimeout(ok, 12000); } };
        });
      };
      module.exports = cucumberSteps;
      """

  Scenario Outline: slow steps timeout
    Given a file named "features/a.feature" with:
      """
      Feature:
        Scenario:
          When a <TYPE> step runs slowly
      """
    When I run cucumber.js with `--strict`
    Then the output includes the text:
      """
      Error: Step timed out after 10000 milliseconds
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
    Then the output includes the text:
      """
      Error: Step timed out after 10000 milliseconds
      """
    Then the exit status should be 1

    Examples:
      | TYPE     |
      | callback |
      | promise  |


  Scenario Outline: the default timeout can be set on the world object
    Given a file named "features/a.feature" with:
      """
      Feature:
        Scenario:
          When a <TYPE> step runs slowly with an increased timeout
      """
    And a file named "features/support/world.js" with:
      """
      var WorldConstructor = function() {
        this.defaultTimeout = 14000;
      };
      module.exports = { World: WorldConstructor };
      """
    When I run cucumber.js with `--strict`
    Then the exit status should be 0

    Examples:
      | TYPE     |
      | callback |
      | promise  |
