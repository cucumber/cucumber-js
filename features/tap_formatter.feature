Feature: Tap Formatter
  In order to pipe results to other testing frameworks
  Developers should be able to consume features in TAP format

  Scenario: Output summary for a feature with no scenarios
    Given a file named "features/a.feature" with:
      """
      Feature: some feature
      """
    When I run `cucumber.js -f tap`
    Then it outputs this text:
      """
      """

  Scenario: Summary formatter hides around, before and after hooks
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
    When I run `cucumber.js -f tap`
    Then it outputs this text:
      """
      TAP version 13
      # I've declared one step which passes
      ok 1 This step is passing
      ok 2 This step is passing
      ok 3 This step is passing

      1..3
      # tests 3
      # pass  3

      # ok
      """
