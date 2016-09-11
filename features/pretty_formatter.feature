Feature: Pretty Formatter
  In order to visualize the tests in an a set of Cucumber features
  Developers should be able to see prettified view of the scenarios that are being executed

  Scenario: Output pretty text for a feature with no scenarios
    Given a file named "features/a.feature" with:
      """
      Feature: some feature
      """
    When I run cucumber.js with `-f pretty`
    Then it outputs this text:
      """
      0 scenarios
      0 steps
      <duration-stat>
      """

  Scenario: Pretty formatter hides before and after hooks
    Given a file named "features/a.feature" with:
      """
      Feature: some feature

      Scenario: I've declared one step which passes
          Given This step is passing
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      var cucumberSteps = function() {
        this.Given(/^This step is passing$/, function(callback) { callback(); });
      };
      module.exports = cucumberSteps;
      """
    And a file named "features/support/hooks.js" with:
      """
      var hooks = function () {
        this.Before(function(scenario, callback) {
          callback();
        });

        this.After(function(scenario, callback) {
          callback();
        });
      };

      module.exports = hooks;
      """
    When I run cucumber.js with `-f pretty`
    Then it outputs this text:
      """
      Feature: some feature

        Scenario: I've declared one step which passes
        ✔ Given This step is passing

      1 scenario (1 passed)
      1 step (1 passed)
      <duration-stat>
      """

  Scenario: Failing hook is reported as a failed step
    Given a file named "features/a.feature" with:
      """
      Feature: some feature

      Scenario: I've declared one step and it is passing
          Given This step is passing
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      var cucumberSteps = function() {
        this.Given(/^This step is passing$/, function(callback) { callback(); });
      };
      module.exports = cucumberSteps;
      """
    And a file named "features/support/hooks.js" with:
      """
      var hooks = function () {
        this.Before(function(scenario, callback) {
          callback('Fail');
        });
      };

      module.exports = hooks;
      """
    When I run cucumber.js with `-f pretty`
    Then it outputs this text:
      """
      Feature: some feature

        Scenario: I've declared one step and it is passing
        - Given This step is passing

      Failures:

      1) Scenario: I've declared one step and it is passing - features/a.feature:3
         Step: Before
         Step Definition: features/support/hooks.js:2
         Message:
           Fail

      1 scenario (1 failed)
      1 step (1 skipped)
      <duration-stat>
      """

  Scenario: Pretty formatter with doc strings
    Given a file named "features/a.feature" with:
      """
      Feature: some feature

        Scenario: some scenario
          Given a basic step
          And a step with a doc string
            \"\"\"
            my doc string
            \"\"\"
          And a basic step
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      var cucumberSteps = function() {
        this.Given(/^a basic step$/, function() { });
        this.Given(/^a step with a doc string$/, function(str) { });
      };
      module.exports = cucumberSteps;
      """
    When I run cucumber.js with `-f pretty`
    Then it outputs this text:
      """
      Feature: some feature

        Scenario: some scenario
        ✔ Given a basic step
        ✔ And a step with a doc string
            \"\"\"
            my doc string
            \"\"\"
        ✔ And a basic step

      1 scenario (1 passed)
      3 steps (3 passed)
      <duration-stat>
      """

  Scenario: pretty formatter with data table
    Given a file named "features/a.feature" with:
      """
      Feature: some feature

        Scenario: some scenario
          Given a table:
          | foo\nbar    |bar |   baz |
          | foo\nbar\n\nbaz\n\\boo       |bar |   baz\nfoo |
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      module.exports = function() {
        this.Given(/^a table:$/, function(table) { });
      };
      """
    When I run cucumber.js with `-f pretty`
    Then it outputs this text:
      """
      Feature: some feature

        Scenario: some scenario
        ✔ Given a table:
            | foo\nbar               | bar | baz      |
            | foo\nbar\n\nbaz\n\\boo | bar | baz\nfoo |

      1 scenario (1 passed)
      1 step (1 passed)
      <duration-stat>
      """
