Feature: Register Handler

  Background:
    Given a file named "features/my_feature.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given a step
      """
    And a file named "features/step_definitions/my_steps.js" with:
      """
      var stepDefinitions = function() {
        this.When(/^a step$/, function () {});
      };

      module.exports = stepDefinitions;
      """

  Scenario: synchronous
    Given a file named "features/support/handlers.js" with:
      """
      var handlers = function() {
        this.registerHandler('AfterFeatures', function () {});
      };

      module.exports = handlers;
      """
    When I run cucumber.js
    And the exit status should be 0

  Scenario: synchronously throws
    Given a file named "features/support/handlers.js" with:
      """
      var handlers = function() {
        this.registerHandler('AfterFeatures', function(){
          throw new Error('my error');
        });
      };

      module.exports = handlers;
      """
    When I run cucumber.js
    And the exit status should be non-zero
    And the error output contains the text:
      """
      features/support/handlers.js:2 my error
      """

  Scenario: callback without error
    Given a file named "features/support/handlers.js" with:
      """
      var handlers = function() {
        this.registerHandler('AfterFeatures', function(features, callback) {
          setTimeout(function () {
            callback();
          });
        });
      };

      module.exports = handlers;
      """
    When I run cucumber.js
    And the exit status should be 0

  Scenario: callback with error
    Given a file named "features/support/handlers.js" with:
      """
      var handlers = function() {
        this.registerHandler('AfterFeatures', function(features, callback) {
          setTimeout(function() {
            callback(new Error('my error'));
          });
        });
      };

      module.exports = handlers
      """
    When I run cucumber.js
    And the exit status should be non-zero
    And the error output contains the text:
      """
      features/support/handlers.js:2 my error
      """

  Scenario: callback asynchronously throws
    Given a file named "features/support/handlers.js" with:
      """
      var handlers = function() {
        this.registerHandler('AfterFeatures', function(features, callback) {
          setTimeout(function(){
            throw new Error('my error');
          });
        });
      };

      module.exports = handlers;
      """
    When I run cucumber.js
    And the exit status should be non-zero

  Scenario: callback - returning a promise
    Given a file named "features/support/handlers.js" with:
      """
      var handlers = function() {
        this.registerHandler('AfterFeatures', function(features, callback) {
          return {
            then: function() {}
          };
        });
      };

      module.exports = handlers;
      """
    When I run cucumber.js
    And the exit status should be non-zero
    And the error output contains the text:
      """
      features/support/handlers.js:2 function uses multiple asynchronous interfaces: callback and promise
      """

  Scenario: promise resolves
    Given a file named "features/support/handlers.js" with:
      """
      var handlers = function() {
        this.registerHandler('AfterFeatures', function() {
          return {
            then: function(resolve, reject) {
              setTimeout(resolve);
            }
          };
        });
      };

      module.exports = handlers;
      """
    When I run cucumber.js
    And the exit status should be 0

  Scenario: promise rejects with error
    Given a file named "features/support/handlers.js" with:
      """
      var handlers = function() {
        this.registerHandler('AfterFeatures', function() {
          return {
            then: function(resolve, reject) {
              setTimeout(function () {
                reject(new Error('my error'));
              });
            }
          };
        });
      };

      module.exports = handlers;
      """
    When I run cucumber.js
    And the exit status should be non-zero
    And the error output contains the text:
      """
      features/support/handlers.js:2 my error
      """

  Scenario: promise rejects without error
    Given a file named "features/support/handlers.js" with:
      """
      var handlers = function() {
        this.registerHandler('AfterFeatures', function() {
          return {
            then: function(resolve, reject) {
              setTimeout(reject);
            }
          };
        });
      };

      module.exports = handlers
      """
    When I run cucumber.js
    And the exit status should be non-zero
    And the error output contains the text:
      """
      features/support/handlers.js:2 Promise rejected
      """

  Scenario: promise asynchronously throws
    Given a file named "features/support/handlers.js" with:
      """
      var handlers = function(){
        this.registerHandler('AfterFeatures', function() {
          return {
            then: function(resolve, reject) {
              setTimeout(function(){
                throw new Error('my error');
              });
            }
          };
        });
      };

      module.exports = handlers;
      """
    When I run cucumber.js
    And the exit status should be non-zero
    And the error output contains the text:
      """
      features/support/handlers.js:2 my error
      """
