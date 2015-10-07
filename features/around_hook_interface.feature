Feature: Around hook interface

  Background:
    Given a file named "features/my_feature.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given a step
      """
    And a file named "features/step_definitions/my_steps.js" with:
      """
      stepDefinitions = function() {
        this.When(/^a step$/, function () {
          this.value += 1;
        });
      };

      module.exports = stepDefinitions
      """

  Scenario: pre - callback with error
    Given a file named "features/support/hooks.js" with:
      """
      assert = require('assert');

      hooks = function() {
        this.Around(function (scenario, runScenario) {
          setTimeout(function() {
            runScenario(new Error('my error'), function() {});
          });
        });
      };

      module.exports = hooks
      """
    When I run cucumber.js
    And the exit status should be 1

  Scenario: pre - asynchronously throws
    Given a file named "features/support/hooks.js" with:
      """
      assert = require('assert');

      hooks = function() {
        this.Around(function (scenario, runScenario) {
          setTimeout(function() {
            throw new Error('my error');
          });
        });
      };

      module.exports = hooks
      """
    When I run cucumber.js
    And the exit status should be 1

  Scenario: post - synchronous
    Given a file named "features/support/hooks.js" with:
      """
      assert = require('assert');

      hooks = function() {
        this.Around(function (scenario, runScenario) {
          this.value = 1;

          runScenario(null, function() {
            assert.equal(this.value, 2);
          });
        });
      };

      module.exports = hooks
      """
    When I run cucumber.js
    And the exit status should be 0

  Scenario: post - synchronously throws
    Given a file named "features/support/hooks.js" with:
      """
      hooks = function() {
        this.Around(function (scenario, runScenario) {
          runScenario(null, function() {
            throw new Error('my error');
          });
        });
      };

      module.exports = hooks
      """
    When I run cucumber.js
    And the exit status should be 1

  Scenario: post - callback without error
    Given a file named "features/support/hooks.js" with:
      """
      assert = require('assert');

      hooks = function() {
        this.Around(function (scenario, runScenario) {
          runScenario(null, function() {
            var world = this;
            setTimeout(function () {
              assert.equal(world.value, 1);
              callback();
            });
          });
        });
      };

      module.exports = hooks
      """
    When I run cucumber.js
    And the exit status should be 0

  Scenario: post - callback with error
    Given a file named "features/support/hooks.js" with:
      """
      hooks = function() {
        this.Around(function (scenario, runScenario) {
          runScenario(null, function(callback) {
            setTimeout(function() {
              callback(new Error('my error'));
            });
          });
        });
      };

      module.exports = hooks
      """
    When I run cucumber.js
    And the exit status should be 1

  Scenario: post - callback asynchronously throws
    Given a file named "features/support/hooks.js" with:
      """
      hooks = function() {
        this.Around(function (scenario, runScenario) {
          runScenario(null, function(callback) {
            setTimeout(function(){
              throw new Error('my error');
            });
          });
        });
      };

      module.exports = hooks
      """
    When I run cucumber.js
    And the exit status should be 1

  Scenario: post - promise resolves
    Given a file named "features/support/my_steps.js" with:
      """
      assert = require('assert');

      hooks = function() {
        this.Around(function (scenario, runScenario) {
          this.value = 1;
          runScenario(null, function() {
            var world = this;
            return {
              then: function(onResolve, onReject) {
                setTimeout(function () {
                  assert.equal(world.value, 2);
                  onResolve();
                });
              }
            };
          });
        });
      };

      module.exports = hooks
      """
    When I run cucumber.js
    And the exit status should be 0

  Scenario: post - promise rejects with error
    Given a file named "features/support/hooks.js" with:
      """
      hooks = function() {
        this.Around(function (scenario, runScenario) {
          runScenario(null, function() {
            return {
              then: function(onResolve, onReject) {
                setTimeout(function () {
                  onReject(new Error('my error'));
                });
              }
            };
          });
        });
      };

      module.exports = hooks
      """
    When I run cucumber.js
    And the exit status should be 1

  Scenario: post - promise rejects without error
    Given a file named "features/support/hooks.js" with:
      """
      hooks = function() {
        this.Around(function (scenario, runScenario) {
          runScenario(null, function() {
            return {
              then: function(onResolve, onReject) {
                setTimeout(onReject);
              }
            };
          });
        });
      };

      module.exports = hooks
      """
    When I run cucumber.js
    And the exit status should be 1

  Scenario: post - promise asynchronously throws
    Given a file named "features/support/hooks.js" with:
      """
      hooks = function() {
        this.Around(function (scenario, runScenario) {
          runScenario(null, function() {
            return {
              then: function(onResolve, onReject) {
                setTimeout(function(){
                  throw new Error('my error');
                });
              }
            };
          });
        });
      };

      module.exports = hooks
      """
    When I run cucumber.js
    And the exit status should be 1
