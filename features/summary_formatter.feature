Feature: Summary Formatter
  In order to get a quick overview of Cucumber test run
  Developers should be able to see a high level summary of the scenarios that were executed

  Scenario: Output summary for a feature with no scenarios
    Given a file named "features/a.feature" with:
      """
      Feature: some feature
      """
    When I run `cucumber.js -f summary`
    Then it outputs this text:
      """
      0 scenarios
      0 steps
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
    When I run `cucumber.js -f summary`
    Then it outputs this text:
      """
      1 scenario (1 passed)
      1 step (1 passed)
      """
