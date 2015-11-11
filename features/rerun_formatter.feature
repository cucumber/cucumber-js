Feature: Rerun Formatter

  In order to allow users to easily run only the failing scenarios
  Users can save the rerun formatter's output to a file and pass it as an argument on the next run

  Scenario: rerun
    Given a file named "features/a.feature" with:
      """
      Feature:
        Scenario: Failing
          Given a failing step

        Scenario: Passing
          Given a passing step
      """
    Given a file named "features/step_definitions/cucumber_steps.js" with:
      """
      var cucumberSteps = function() {
        this.When(/^a failing step$/, function() { throw 'fail' });
        this.When(/^a passing step$/, function() { });
      };
      module.exports = cucumberSteps;
      """
    When I run cucumber.js with `-f rerun:@rerun.txt`
    Then it outputs this text:
      """
      Feature:

        Scenario: Failing      # features/a.feature:2
          Given a failing step # features/a.feature:3
            fail

        Scenario: Passing      # features/a.feature:5
          Given a passing step # features/a.feature:6

      Failing scenarios:
      features/a.feature:2 # Scenario: Failing

      2 scenarios (1 failed, 1 passed)
      2 steps (1 failed, 1 passed)
      <duration-stat>
      """
    And the file "@rerun.txt" has the text:
      """
      features/a.feature:2
      """
    When I run cucumber.js with `@rerun.txt`
    Then it outputs this text:
      """
      Feature:

        Scenario: Failing      # features/a.feature:2
          Given a failing step # features/a.feature:3
            fail

      Failing scenarios:
      features/a.feature:2 # Scenario: Failing

      1 scenario (1 failed)
      1 step (1 failed)
      <duration-stat>
      """
