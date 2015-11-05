Feature: default command line arguments

  In order to prevent users from having to enter the options they use every time
  Users can define cucumber.js with profiles which are groups of command line arguments.

  Background:
    Given a file named "features/a.feature" with:
      """
      Feature: some feature
        Scenario: some scenario
          Given a passing step
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      var cucumberSteps = function() {
        this.Given(/^a passing step$/, function () {});
      };
      module.exports = cucumberSteps;
      """
    And a file named "cucumber.js" with:
      """
      module.exports = {
        'default': '--format summary',
        minimal: '--no-snippets',
        progress: '--format progress'
      };
      """

  Scenario: default profile
    When I run cucumber-js
    Then it outputs this text:
      """
      1 scenario (1 passed)
      1 step (1 passed)
      <duration-stat>
      """

  Scenario Outline: specifying a profile
    When I run cucumber-js with `<OPT> progress`
    Then it outputs this text:
      """
      .

      1 scenario (1 passed)
      1 step (1 passed)
      <duration-stat>
      """

    Examples:
      | OPT       |
      | -p        |
      | --profile |

  Scenario: specifying multiple profiles
    Given a file named "features/a.feature" with:
      """
      Feature: some feature
        Scenario: some scenario
          Given a passing step
          And a undefined step
      """
    When I run cucumber-js with `-p progress -p minimal`
    Then it outputs this text:
      """
      .U

      1 scenario (1 undefined)
      2 steps (1 undefined, 1 passed)
      <duration-stat>
      """

  Scenario: overriding the default profile
    When I run cucumber-js with `-f pretty`
    Then it outputs this text:
      """
      Feature: some feature

        Scenario: some scenario   # features/a.feature:2
          Given a passing step    # features/step_definitions/cucumber_steps.js:2

      1 scenario (1 passed)
      1 step (1 passed)
      <duration-stat>
      """
