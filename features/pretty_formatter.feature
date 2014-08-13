Feature: Pretty Formatter
  In order to visualize the tests in an a set of Cucumber features
  Developers should be able to see prettified view of the scenarios that are being executed

  Scenario: Output pretty text for a feature with no scenarios
    Given a file named "features/a.feature" with:
      """
      Feature: some feature
      """
    When I run `cucumber.js -f pretty`
    Then it outputs this text:
      """
      Feature: some feature



      0 scenarios
      0 steps
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
        this.Before(function(callback) {
          callback();
        });

        this.After(function(callback) {
          callback();
        });

        this.Around(function(runScenario) {
          runScenario(function(callback) {
            callback();
          });
        });
      };

      module.exports = hooks;
      """
    When I run `cucumber.js -f pretty`
    Then it outputs this text:
      """
      Feature: some feature



        Scenario: I've declared one step which passes   # features/a.feature:3
          Given This step is passing                    # features/a.feature:4


      1 scenario (1 passed)
      1 step (1 passed)
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
        this.Before(function(callback) {
          callback('Fail');
        });
      };

      module.exports = hooks;
      """
    When I run `cucumber.js -f pretty`
    Then it outputs this text:
      """
      Feature: some feature



        Scenario: I've declared one step and it is passing   # features/a.feature:3
          Before
            Fail
          Given This step is passing                         # features/a.feature:4


      (::) failed steps (::)

      Fail

      Failing scenarios:
      <current-directory>/features/a.feature:3 # Scenario: I've declared one step and it is passing

      1 scenario (1 failed)
      2 steps (1 failed, 1 skipped)
      """
