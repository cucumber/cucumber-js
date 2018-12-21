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
      import {Given} from 'cucumber'

      Given(/^a passing step$/, function() {})
      """
    And a file named "cucumber.js" with:
      """
      var common = '--require-module @babel/register ';

      module.exports = {
        'default': common + '--format summary',
        dry: common + '--dry-run',
        progress: common + '--format progress'
      };
      """

  Scenario: default profile
    When I run cucumber-js
    Then it outputs the text:
      """
      1 scenario (1 passed)
      1 step (1 passed)
      <duration-stat>
      """

  Scenario Outline: specifying a profile
    When I run cucumber-js with `<OPT> progress`
    Then it outputs the text:
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
    When I run cucumber-js with `-p dry -p progress`
    Then it outputs the text:
      """
      -

      1 scenario (1 skipped)
      1 step (1 skipped)
      <duration-stat>
      """

  Scenario: overriding the default profile
    When I run cucumber-js with `-f summary`
    Then it outputs the text:
      """
      1 scenario (1 passed)
      1 step (1 passed)
      <duration-stat>
      """
