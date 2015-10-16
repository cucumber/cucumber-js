Feature: After hook interface

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
          this.value = 1;
        });
      };

      module.exports = stepDefinitions
      """

  Scenario: too many arguments
    Given a file named "features/support/hooks.js" with:
      """
      assert = require('assert');

      hooks = function() {
        this.After(function (arg1, arg2, arg3) {});
      };

      module.exports = hooks
      """
    When I run cucumber.js
    And the exit status should be 1
    And the output contains the text:
      """
      hook has 3 arguments, should have 0 or 1 (if synchronous or returning a promise) or 2 (if accepting a callback)
      """

  Scenario: synchronous
    Given a file named "features/support/hooks.js" with:
      """
      assert = require('assert');

      hooks = function() {
        this.After(function () {
          assert.equal(this.value, 1);
        });
      };

      module.exports = hooks
      """
    When I run cucumber.js
    And the exit status should be 0

  Scenario: synchronously throws
    Given a file named "features/support/hooks.js" with:
      """
      hooks = function() {
        this.After(function(){
          throw new Error('my error');
        });
      };

      module.exports = hooks
      """
    When I run cucumber.js
    And the exit status should be 1

  Scenario: callback without error
    Given a file named "features/support/hooks.js" with:
      """
      assert = require('assert');

      hooks = function() {
        this.After(function (scenario, callback) {
          var world = this;
          setTimeout(function () {
            assert.equal(world.value, 1);
            callback();
          });
        });
      };

      module.exports = hooks
      """
    When I run cucumber.js
    And the exit status should be 0

  Scenario: callback with error
    Given a file named "features/support/hooks.js" with:
      """
      hooks = function() {
        this.After(function (scenario, callback) {
          setTimeout(function() {
            callback(new Error('my error'));
          });
        });
      };

      module.exports = hooks
      """
    When I run cucumber.js
    And the exit status should be 1

  Scenario: callback asynchronously throws
    Given a file named "features/support/hooks.js" with:
      """
      hooks = function() {
        this.After(function(scenario, callback){
          setTimeout(function(){
            throw new Error('my error');
          });
        });
      };

      module.exports = hooks
      """
    When I run cucumber.js
    And the exit status should be 1

  Scenario: callback - returning a promise
    Given a file named "features/step_definitions/failing_steps.js" with:
      """
      hooks = function() {
        this.After(function(scenario, callback){
          return {
            then: function(onResolve, onReject) {}
          };
        });
      };

      module.exports = hooks
      """
    When I run cucumber.js with `-f json`
    And the exit status should be 1
    And the output contains the text:
      """
      hook accepts a callback and returns a promise
      """

  Scenario: promise resolves
    Given a file named "features/support/hooks.js" with:
      """
      assert = require('assert');

      hooks = function() {
        this.After(function(){
          var world = this;
          return {
            then: function(onResolve, onReject) {
              setTimeout(function () {
                assert.equal(world.value, 1);
                onResolve();
              });
            }
          };
        });
      };

      module.exports = hooks
      """
    When I run cucumber.js
    And the exit status should be 0

  Scenario: promise rejects with error
    Given a file named "features/support/hooks.js" with:
      """
      hooks = function() {
        this.After(function(){
          return {
            then: function(onResolve, onReject) {
              setTimeout(function () {
                onReject(new Error('my error'));
              });
            }
          };
        });
      };

      module.exports = hooks
      """
    When I run cucumber.js
    And the exit status should be 1

  Scenario: promise rejects without error
    Given a file named "features/support/hooks.js" with:
      """
      hooks = function() {
        this.After(function(){
          return {
            then: function(onResolve, onReject) {
              setTimeout(onReject);
            }
          };
        });
      };

      module.exports = hooks
      """
    When I run cucumber.js
    And the exit status should be 1

  Scenario: promise asynchronously throws
    Given a file named "features/support/hooks.js" with:
      """
      hooks = function(){
        this.After(function(){
          return {
            then: function(onResolve, onReject) {
              setTimeout(function(){
                throw new Error('my error');
              });
            }
          };
        });
      };

      module.exports = hooks
      """
    When I run cucumber.js
    And the exit status should be 1
