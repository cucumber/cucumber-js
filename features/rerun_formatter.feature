Feature: Rerun Formatter

  In order to allow users to easily run only the failing scenarios
  Users can save the rerun formatter's output to a file and pass it as an argument on the next run

  Background:
    Given a file named "features/a.feature" with:
      """
      Feature: A
        Scenario: 1
          Given a passing step

        Scenario: 2
          Given a failing step

        Scenario: 3
          Given a failing step
      """
    And a file named "features/b.feature" with:
      """
      Feature: B
        Scenario: 4
          Given a passing step

        Scenario: 5
          Given a failing step
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      var cucumberSteps = function() {
        this.When(/^a passing step$/, function() { });
        this.When(/^a failing step$/, function() { throw 'fail' });
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
    Then it outputs this text:
      """
      Feature: A

        Scenario: 1            # features/a.feature:2
          Given a passing step # features/step_definitions/cucumber_steps.js:2

      1 scenario (1 passed)
      1 step (1 passed)
      <duration-stat>
      """
    And the file "@rerun.txt" has the text:
      """
      """

  Scenario: multiple scenarios failing
    When I run cucumber.js
    Then it outputs this text:
      """
      Feature: A

        Scenario: 1            # features/a.feature:2
          Given a passing step # features/step_definitions/cucumber_steps.js:2

        Scenario: 2            # features/a.feature:5
          Given a failing step # features/step_definitions/cucumber_steps.js:3
            fail

        Scenario: 3            # features/a.feature:8
          Given a failing step # features/step_definitions/cucumber_steps.js:3
            fail

      Feature: B

        Scenario: 4            # features/b.feature:2
          Given a passing step # features/step_definitions/cucumber_steps.js:2

        Scenario: 5            # features/b.feature:5
          Given a failing step # features/step_definitions/cucumber_steps.js:3
            fail

      Failing scenarios:
      features/a.feature:5 # Scenario: 2
      features/a.feature:8 # Scenario: 3
      features/b.feature:5 # Scenario: 5

      5 scenarios (3 failed, 2 passed)
      5 steps (3 failed, 2 passed)
      <duration-stat>
      """
    And the file "@rerun.txt" has the text:
      """
      features/a.feature:5:8
      features/b.feature:5
      """
    When I run cucumber.js with `@rerun.txt`
    Then it outputs this text:
      """
      Feature: A

        Scenario: 2            # features/a.feature:5
          Given a failing step # features/step_definitions/cucumber_steps.js:3
            fail

        Scenario: 3            # features/a.feature:8
          Given a failing step # features/step_definitions/cucumber_steps.js:3
            fail

      Feature: B

        Scenario: 5            # features/b.feature:5
          Given a failing step # features/step_definitions/cucumber_steps.js:3
            fail

      Failing scenarios:
      features/a.feature:5 # Scenario: 2
      features/a.feature:8 # Scenario: 3
      features/b.feature:5 # Scenario: 5

      3 scenarios (3 failed)
      3 steps (3 failed)
      <duration-stat>
      """
