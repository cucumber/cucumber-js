Feature: Passing steps

  Background:
    Given a file named "features/passing_steps.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given a passing step
      """

  Scenario: synchronous
    Given a file named "features/step_definitions/passing_steps.js" with:
      """
      stepDefinitions = function() {
        this.Given(/^a passing step$/, function(){});
      };

      module.exports = stepDefinitions
      """
    When I run cucumber.js with `-f json`
    Then the step "a passing step" has status passed

  Scenario: asynchronous
    Given a file named "features/step_definitions/passing_steps.js" with:
      """
      stepDefinitions = function() {
        this.When(/^a passing step$/, function(callback){
          setTimeout(callback);
        });
      };

      module.exports = stepDefinitions
      """
    When I run cucumber.js with `-f json`
    Then the step "a passing step" has status passed

  Scenario: promise
    Given a file named "features/step_definitions/passing_steps.js" with:
      """
      stepDefinitions = function() {
        this.When(/^a passing step$/, function(){
          return {
            then: function(resolve, reject) {
              setTimeout(resolve);
            }
          };
        });
      };

      module.exports = stepDefinitions
      """
    When I run cucumber.js with `-f json`
    Then the step "a passing step" has status passed
