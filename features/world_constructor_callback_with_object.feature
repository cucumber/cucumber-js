Feature: World

  Scenario: World constructor
    Given a file named "features/world.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given a step
      """
    And a file named "features/step_definitions/world_steps.js" with:
      """
      var assert = require('assert');

      var stepDefinitions = function() {
        this.Given(/^a step$/, function() {
          var world = this;
          assert(world.implicit);
        });

        this.World = function WorldConstructor(callback) {
          this.implicit = true;
          callback();
        };
      };

      module.exports = stepDefinitions;
      """
    When I run cucumber.js with `--strict`
    Then the exit status should be 0


  Scenario: World is explicit object
    Given a file named "features/world.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given a step
      """
    And a file named "features/step_definitions/world_steps.js" with:
      """
      var assert = require('assert');

      var stepDefinitions = function() {
        this.Given(/^a step$/, function() {
          var world = this;
          assert(world.explicit);
        });

        this.World = function WorldConstructor(callback) {
          var myCustomWorld = { explicit: true };
          callback(myCustomWorld);
        };
      };

      module.exports = stepDefinitions;
      """
    When I run cucumber.js with `--strict`
    Then the exit status should be 0
