Feature: Core feature elements execution
  In order to have automated acceptance tests
  As a developer
  I want Cucumber to run core feature elements

  Scenario: simple
    Given a file named "features/a.feature" with:
      """
      Feature: some feature
        Scenario:
          Given a step passes
          When a step passes
          Then a step passes
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      var cucumberSteps = function() {
        this.When(/^a step passes$/, function() {});
      };
      module.exports = cucumberSteps;
      """
    When I run cucumber-js with `--strict`
    Then it passes

  Scenario: Given, When, Then, And and But steps
    Given a file named "features/a.feature" with:
      """
      Feature: Given, When, Then, And and But step execution
        Scenario: All kinds of steps
          Given a "Given" step passes
          When a "When" step passes
          Then a "Then" step passes

        Scenario: All kinds of steps with And's and But's
          Given a "Given" step passes
          And a "Given" step passes
          But a "Given" step passes
          When a "When" step passes
          And a "When" step passes
          But a "When" step passes
          Then a "Then" step passes
          And a "Then" step passes
          But a "Then" step passes
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      var cucumberSteps = function() {
        this.Given(/^a "Given" step passes$/, function() {});
        this.When(/^a "When" step passes$/, function() {});
        this.Then(/^a "Then" step passes$/, function() {});
      };
      module.exports = cucumberSteps;
      """
    When I run cucumber-js with `--strict`
    Then it passes

  Scenario: Step definition body is executed
    Given a file named "features/a.feature" with:
      """
      Feature: Step definition body execution
        Scenario: Step definition body is executed once
          When I call a watched step
          Then the watched step should have been called 1 time

        Scenario: Step definition body is executed several times
          When I call a watched step
          And I call a watched step
          And I call a watched step
          Then the watched step should have been called 3 times
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      var assert = require('assert');

      var cucumberSteps = function() {
        this.World = function () {
          this.count = 0;
        };

        this.When(/^I call a watched step$/, function() {
          this.count += 1
        });

        this.Then(/^the watched step should have been called (\d+) times?$/, function(count){
          assert.equal(this.count, parseInt(count));
        });
      };
      module.exports = cucumberSteps;
      """
    When I run cucumber-js with `--strict`
    Then it passes

  Scenario: Steps accepting parameters
    Given a file named "features/a.feature" with:
      """
      Feature: Steps receiving parameters
        Scenario: Single-parameter step
          When I call a step with "a parameter"
          Then the 1st received parameter should be "a parameter"

        Scenario: Three-parameter step
          When I call a step with "one", "two" and "three"
          Then the 1st received parameter should be "one"
          And the 2nd received parameter should be "two"
          And the 3rd received parameter should be "three"
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      var assert = require('assert');

      var cucumberSteps = function() {
        this.World = function () {
          this.parameters = {};
        };

        this.When(/^I call a step with "([^"]*)"$/, function(arg) {
          this.parameters['1'] = arg;
        });

        this.When(/^I call a step with "([^"]*)", "([^"]*)" and "([^"]*)"$/, function(arg1, arg2, arg3) {
          this.parameters['1'] = arg1;
          this.parameters['2'] = arg2;
          this.parameters['3'] = arg3;
        })

        this.Then(/^the (\d+)(?:st|nd|rd) received parameter should be "([^"]*)"$/, function(index, arg){
          assert.equal(this.parameters[index], arg);
        });
      };
      module.exports = cucumberSteps;
      """
    When I run cucumber-js with `--strict`
    Then it passes
