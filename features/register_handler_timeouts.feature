Feature: registerHandler timeouts

  Background:
    Given a file named "features/a.feature" with:
      """
      Feature:
        Scenario:
          Given a passing step
      """
    And a file named "features/step_definitions/steps.js" with:
      """
      module.exports = function() {
        this.Given(/^a passing step$/, function() {});
      };
      """

  Scenario: slow handler timeout
    Given a file named "features/supports/handlers.js" with:
      """
      module.exports = function() {
        this.setDefaultTimeout(500);

        this.registerHandler('AfterFeatures', function(features, callback) {
          setTimeout(callback, 1000);
        });
      };
      """
    When I run cucumber.js with `--strict`
    Then the error output contains the text:
      """
      features/supports/handlers.js:4 function timed out after 500 milliseconds
      """
    And the exit status should be non-zero


  Scenario: slow handler can increase their timeout
    Given a file named "features/supports/handlers.js" with:
      """
      module.exports = function() {
        this.setDefaultTimeout(500);

        this.registerHandler('AfterFeatures', {timeout: 1500}, function(features, callback) {
          setTimeout(callback, 1000);
        });
      };
      """
    When I run cucumber.js with `--strict`
    Then the exit status should be 0
