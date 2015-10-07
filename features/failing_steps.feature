Feature: Failing steps

  Background:
    Given a file named "features/fail.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given a failing step
      """

  Scenario: synchronous - throws
    Given a file named "features/step_definitions/failing_steps.js" with:
      """
      stepDefinitions = function() {
        this.When(/^a failing step$/, function(){
          throw new Error('my error');
        });
      };

      module.exports = stepDefinitions
      """
    When I run cucumber.js with `-f json`
    Then the step "a failing step" has status failed with "my error"

  Scenario: asynchronous - throws
    Given a file named "features/step_definitions/failing_steps.js" with:
      """
      stepDefinitions = function() {
        this.When(/^a failing step$/, function(callback){
          setTimeout(function(){
            throw new Error('my error');
          });
        });
      };

      module.exports = stepDefinitions
      """
    When I run cucumber.js with `-f json`
    Then the step "a failing step" has status failed with "my error"

  Scenario: asynchronous - passing error as first argument to the callback
    Given a file named "features/step_definitions/failing_steps.js" with:
      """
      stepDefinitions = function() {
        this.When(/^a failing step$/, function(callback){
          setTimeout(function(){
            callback(new Error('my error'));
          });
        });
      };

      module.exports = stepDefinitions
      """
    When I run cucumber.js with `-f json`
    Then the step "a failing step" has status failed with "my error"

  Scenario: promise - throws
    Given a file named "features/step_definitions/failing_steps.js" with:
      """
      stepDefinitions = function() {
        this.When(/^a failing step$/, function(callback){
          return {
            then: function(resolve, reject) {
              setTimeout(function(){
                throw new Error('my error');
              });
            }
          };
        });
      };

      module.exports = stepDefinitions
      """
    When I run cucumber.js with `-f json`
    Then the step "a failing step" has status failed with "my error"

  Scenario: promise - rejects
    Given a file named "features/step_definitions/failing_steps.js" with:
      """
      stepDefinitions = function() {
        this.When(/^a failing step$/, function(callback){
          return {
            then: function(resolve, reject) {
              setTimeout(function(){
                reject(new Error('my error'));
              });
            }
          };
        });
      };

      module.exports = stepDefinitions
      """
    When I run cucumber.js with `-f json`
    Then the step "a failing step" has status failed with "my error"
