Feature: World Parameters
  As a developer testing multiple environments
  I would like the ability to pass in parameters to the world constructor through the CLI
  So I can easily switch to

  Background:
    Given a file named "features/passing_steps.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given the world parameters are correct
      """

  Scenario: Invalid JSON
    When I run cucumber.js with `--world-parameters '{"a":}'`
    Then the error output contains the text:
      """
      --world-parameters passed invalid JSON: Unexpected token }
      """
    And the error output contains the text:
      """
      {"a":}
      """
    And the exit status should be non-zero

  Scenario: Non-object
    When I run cucumber.js with `--world-parameters '[1,2]'`
    Then the error output contains the text:
      """
      --world-parameters must be passed a JSON string of an object: [1,2]
      """
    And the exit status should be non-zero

  Scenario: default world constructor has an empty parameters object by default
    Given a file named "features/step_definitions/my_steps.js" with:
      """
      var assert = require('assert');

      stepDefinitions = function() {
        this.Given(/^the world parameters are correct$/, function () {
          assert.deepEqual(this.parameters, {});
        });
      };

      module.exports = stepDefinitions
      """
    When I run cucumber.js with `-f json`
    Then the step "the world parameters are correct" has status passed

  Scenario: default world constructor saves the parameters
    Given a file named "features/step_definitions/my_steps.js" with:
      """
      var assert = require('assert');

      stepDefinitions = function() {
        this.Given(/^the world parameters are correct$/, function () {
          assert.equal(this.parameters.a, 1);
        });
      };

      module.exports = stepDefinitions
      """
    When I run cucumber.js with `-f json --world-parameters '{"a":1}'`
    Then the step "the world parameters are correct" has status passed

  Scenario: multiple world parameters are merged with the last taking precedence
    Given a file named "features/step_definitions/my_steps.js" with:
      """
      var assert = require('assert');

      stepDefinitions = function() {
        this.Given(/^the world parameters are correct$/, function () {
          assert.equal(this.parameters.a, 3);
          assert.equal(this.parameters.b, 2);
        });
      };

      module.exports = stepDefinitions
      """
    When I run cucumber.js with `-f json --world-parameters '{"a":1,"b":2}' --world-parameters '{"a":3}'`
    Then the step "the world parameters are correct" has status passed

  Scenario: custom world constructor is passed the parameters
    Given a file named "features/support/world.js" with:
      """
      function CustomWorld(parameters) {
        for(key in parameters) {
          this[key] = parameters[key];
        }
      }

      module.exports = function() {
        this.World = CustomWorld;
      };
      """
    Given a file named "features/step_definitions/my_steps.js" with:
      """
      var assert = require('assert');

      stepDefinitions = function() {
        this.Given(/^the world parameters are correct$/, function () {
          assert.equal(this.a, 1);
        });
      };

      module.exports = stepDefinitions
      """
    When I run cucumber.js with `-f json --world-parameters '{"a":1}'`
    Then the step "the world parameters are correct" has status passed
