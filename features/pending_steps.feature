Feature: Pending steps

  Background:
    Given a file named "features/pending.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given a pending step
      """

  Scenario: Asynchronous pending step
    Given a file named "features/step_definitions/failing_steps.js" with:
      """
      stepDefinitions = function() {
        this.When(/^a pending step$/, function(callback){
          callback.pending();
        });
      };

      module.exports = stepDefinitions
      """
    When I run cucumber.js with `-f json`
    Then the step "a pending step" has status pending
