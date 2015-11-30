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
      Feature: some feature

      0 scenarios
      0 steps
      <duration-stat>
      """

  Scenario: Pretty formatter hides around, before and after hooks
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

        this.Around(function(scenario, runScenario) {
          runScenario(null, function(callback) {
            callback();
          });
        });
      };

      module.exports = hooks;
      """
    When I run cucumber.js with `-f pretty`
    Then it outputs this text:
      """
      Feature: some feature

        Scenario: I've declared one step which passes   # features/a.feature:3
          Given This step is passing                    # features/step_definitions/cucumber_steps.js:2

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

        Scenario: I've declared one step and it is passing   # features/a.feature:3
          Before                                             # features/support/hooks.js:2
            Fail
          Given This step is passing                         # features/step_definitions/cucumber_steps.js:2

      Failing scenarios:
      features/a.feature:3 # Scenario: I've declared one step and it is passing

      1 scenario (1 failed)
      1 step (1 skipped)
      <duration-stat>
      """

  Scenario: output with --no-source flag should not show file sources
    Given a file named "features/a.feature" with:
      """
      Feature: some feature
        Scenario: I haven't done anything yet
          Given This step is passing
      """
     And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      var cucumberSteps = function() {
        this.Given(/^This step is passing$/, function(callback) { callback(); });
      };
      module.exports = cucumberSteps;
      """
    When I run cucumber.js with `-f pretty --no-source`
    Then it outputs this text:
      """
      Feature: some feature

        Scenario: I haven't done anything yet
          Given This step is passing

      1 scenario (1 passed)
      1 step (1 passed)
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

        Scenario: some scenario        # features/a.feature:3
          Given a basic step           # features/step_definitions/cucumber_steps.js:2
          And a step with a doc string # features/step_definitions/cucumber_steps.js:3
            \"\"\"
            my doc string
            \"\"\"
          And a basic step             # features/step_definitions/cucumber_steps.js:2

      1 scenario (1 passed)
      3 steps (3 passed)
      <duration-stat>
      """
