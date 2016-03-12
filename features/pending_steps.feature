Feature: Pending steps

  Background:
    Given a file named "features/pending.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given a pending step
      """

  Scenario: Synchronous pending step
    Given a file named "features/step_definitions/failing_steps.js" with:
      """
      stepDefinitions = function() {
        this.When(/^a pending step$/, function(){
          return 'pending';
        });
      };

      module.exports = stepDefinitions
      """
    When I run cucumber.js with `-f json`
    Then the step "a pending step" has status pending


  Scenario: Callback pending step
    Given a file named "features/step_definitions/failing_steps.js" with:
      """
      stepDefinitions = function() {
        this.When(/^a pending step$/, function(callback){
          callback(null, 'pending');
        });
      };

      module.exports = stepDefinitions
      """
    When I run cucumber.js with `-f json`
    Then the step "a pending step" has status pending

  Scenario: Promise pending step
    Given a file named "features/step_definitions/failing_steps.js" with:
      """
      stepDefinitions = function() {
        this.When(/^a pending step$/, function(){
          return {
            then: function(onResolve, onReject) {
              setTimeout(function () {
                onResolve('pending');
              });
            }
          };
        });
      };

      module.exports = stepDefinitions
      """
    When I run cucumber.js with `-f json`
    Then the step "a pending step" has status pending
