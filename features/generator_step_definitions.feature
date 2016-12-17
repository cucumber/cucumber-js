@node-6 @node-4
Feature: Generator Step Definitions
  In order to use new JavaScript features
  As a developer
  I want Cucumber to provide the possibility to use ES6 features

  Background:
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

  Scenario: without generator function runner
    When I run cucumber-js
    Then the exit status should be 1
    And the error output contains the text:
      """
      The following hook/step definitions use generator functions:

        features/step_definitions/cucumber_steps.js:8

      Use 'this.setDefinitionFunctionWrapper(fn)' to wrap then in a function that returns a promise
      """

  Scenario: with generator function wrapper
    Given a file named "features/support/setup.js" with:
      """
      var isGenerator = require('is-generator');
      var Promise = require('bluebird');

      module.exports = function () {
        this.setDefinitionFunctionWrapper(function (fn) {
          if (isGenerator.fn(fn)) {
            return Promise.coroutine(fn);
          } else {
            return fn;
          }
        });
      };
      """
    When I run cucumber-js
    Then the exit status should be 0
