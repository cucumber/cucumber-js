Feature: ES6 compatibility
  In order to use new JavaScript features
  As a developer
  I want Cucumber to provide the possibility to use ES6 features

  @es6
  Scenario: Step is a generator
    Given a file named "features/a.feature" with:
      """
      Feature: Step is a generator
      Scenario: Step generator run successfully
        When I call a step which is a generator with return value "ok"
        Then I can see the yielded "ok" value in the context
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      var assert = require('assert');

      var cucumberSteps = function() {
        this.World = function () {
          this.context = "";
        };

        this.When(/^I call a step which is a generator with return value "([^"]*)"$/, function *(return_value) {
          this.context = yield Promise.resolve(return_value);
        });

        this.Then(/^I can see the yielded "([^"]*)" value in the context$/, function(return_value){
          assert.equal(this.context, return_value);
        });
      };
      module.exports = cucumberSteps;
      """
    When I run cucumber-js with `--strict`
    Then it passes
