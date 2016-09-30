Feature: Rerun Formatter

  In order to allow users to easily run only the failing scenarios
  Users can save the rerun formatter's output to a file and pass it as an argument on the next run

  Background:
    Given a file named "features/a.feature" with:
      """
      Feature: A
        Scenario: A - passing
          Given a passing step

        Scenario: A - failing
          Given a failing step

        Scenario: A - ambiguous
          Given an ambiguous step
      """
    And a file named "features/b.feature" with:
      """
      Feature: B
        Scenario: B - passing
          Given a passing step

        Scenario: B - pending
          Given a pending step
      """
      And a file named "features/c.feature" with:
        """
        Feature: B
          Scenario: C - passing
            Given a passing step

          Scenario: C - undefined
            Given an undefined step
        """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      var cucumberSteps = function() {
        this.Given(/^a passing step$/, function() { });
        this.Given(/^a failing step$/, function() { throw 'fail' });
        this.Given(/^an ambiguous step$/, function() { });
        this.Given(/^an? ambiguous step$/, function() { });
        this.Given(/^a pending step$/, function() { return 'pending' });
      };
      module.exports = cucumberSteps;
      """
    And a file named "cucumber.js" with:
      """
      module.exports = {
        'default': '--format rerun:@rerun.txt',
      };
      """

  Scenario: passing
    When I run cucumber.js with `features/a.feature:2`
    Then the exit status should be 0
    And the file "@rerun.txt" has the text:
      """
      """

  Scenario: multiple scenarios failing
    When I run cucumber.js with `-f json`
    Then the exit status should be 1
    And the json output has the scenarios with names
      | NAME          |
      | A - passing   |
      | A - failing   |
      | A - ambiguous |
      | B - passing   |
      | B - pending   |
      | C - passing   |
      | C - undefined |
    And the file "@rerun.txt" has the text:
      """
      features/a.feature:5:8
      features/b.feature:5
      features/c.feature:5
      """
    When I run cucumber.js with `-f json @rerun.txt`
    Then the exit status should be 1
    And the json output has the scenarios with names
      | NAME          |
      | A - failing   |
      | A - ambiguous |
      | B - pending   |
      | C - undefined |
