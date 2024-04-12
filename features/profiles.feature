Feature: default command line arguments

  In order to prevent users from having to enter the options they use every time
  Users can define cucumber.js with profiles which are groups of command line arguments
  or partial configuration objects.

  Background:
    Given a file named "features/a.feature" with:
      """
      Feature: some feature
        Scenario: some scenario
          Given a passing step
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      const {Given} = require('@cucumber/cucumber')

      Given(/^a passing step$/, function() {})
      """
    And a file named "cucumber.js" with:
      """
      module.exports = {
        'default': '--format summary',
        dry: {
          dryRun: true
        },
        progress: '--format progress'
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

  Scenario Outline: specifying a configuration file
    Given a file named ".cucumber-rc.js" with:
      """
      module.exports = {
        'default': '--dry-run'
      };
      """
    When I run cucumber-js with `<OPT> .cucumber-rc.js`
    Then it outputs the text:
      """
      -

      1 scenario (1 skipped)
      1 step (1 skipped)
      <duration-stat>
      """

    Examples:
      | OPT      |
      | -c       |
      | --config |

  Scenario Outline: specifying a esm configuration file with default function profile
    Given a file named ".cucumber-rc.mjs" with:
      """
      export default function buildProfiles() {
        return {
          default: '--dry-run'
        }
      }
      """
    When I run cucumber-js with `-c .cucumber-rc.mjs`
    Then it outputs the text:
      """
      -

      1 scenario (1 skipped)
      1 step (1 skipped)
      <duration-stat>
      """

  Scenario: specifying a configuration file that doesn't exist
    When I run cucumber-js with `--config doesntexist.js`
    Then it fails

  Scenario: using a JSON file
    Given a file named ".cucumber-rc.json" with:
      """
      {
        "default": {
          "dryRun": true
        }
      }
      """
    When I run cucumber-js with `--config .cucumber-rc.json`
    Then it outputs the text:
      """
      -

      1 scenario (1 skipped)
      1 step (1 skipped)
      <duration-stat>
      """

  Scenario: using a YAML file
    Given a file named ".cucumber-rc.yaml" with:
      """
      default:
        dryRun: true
      """
    When I run cucumber-js with `--config .cucumber-rc.yaml`
    Then it outputs the text:
      """
      -

      1 scenario (1 skipped)
      1 step (1 skipped)
      <duration-stat>
      """
