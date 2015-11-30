Feature: Environment Hooks

  Scenario: Hooks are steps
    Given a file named "features/a.feature" with:
      """
      Feature: some feature

      Scenario: I've declared one step and it is passing
          Given This step is passing
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      var cucumberSteps = function() {
        this.Given(/^This step is passing$/, function(callback) { callback(); });
      };
      module.exports = cucumberSteps;
      """
    And a file named "features/support/hooks.js" with:
      """
      var hooks = function () {
        this.Before(function(scenario, callback) {
          callback();
        });

        this.After(function(scenario, callback) {
          callback();
        });

        this.Around(function(scenario, runScenario) {
          runScenario(null, function(callback) {
            callback();
          });
        });

        // This should not run
        this.Around("@foo", function(runScenario) {
          runScenario(null, function(callback) {
            callback();
          });
        });
      };

      module.exports = hooks;
      """
    When I run cucumber.js with `-f json`
    Then it outputs this json:
      """
      [
        {
          "id": "some-feature",
          "name": "some feature",
          "description": "",
          "line": 1,
          "keyword": "Feature",
          "uri": "<current-directory>/features/a.feature",
          "elements": [
            {
              "name": "I've declared one step and it is passing",
              "id": "some-feature;i've-declared-one-step-and-it-is-passing",
              "line": 3,
              "keyword": "Scenario",
              "description": "",
              "type": "scenario",
              "steps": [
                {
                  "keyword": "Around ",
                  "hidden": true,
                  "result": {
                    "duration": "<duration>",
                    "status": "passed"
                  },
                  "match": {}
                },
                {
                  "keyword": "Before ",
                  "hidden": true,
                  "result": {
                    "duration": "<duration>",
                    "status": "passed"
                  },
                  "match": {}
                },
                {
                  "name": "This step is passing",
                  "line": 4,
                  "keyword": "Given ",
                  "result": {
                    "duration": "<duration>",
                    "status": "passed"
                  },
                  "match": {}
                },
                {
                  "keyword": "After ",
                  "hidden": true,
                  "result": {
                    "duration": "<duration>",
                    "status": "passed"
                  },
                  "match": {}
                },
                {
                  "keyword": "Around ",
                  "hidden": true,
                  "result": {
                    "duration": "<duration>",
                    "status": "passed"
                  },
                  "match": {}
                }
              ]
            }
          ]
        }
      ]
      """

  Scenario: Failing around hook (pre scenario) fails the scenario
    Given a file named "features/a.feature" with:
      """
      Feature: some feature

      Scenario: I've declared one step and it is passing
          Given This step is passing
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      var cucumberSteps = function() {
        this.Given(/^This step is passing$/, function(callback) { callback(); });
      };
      module.exports = cucumberSteps;
      """
    And a file named "features/support/hooks.js" with:
      """
      var hooks = function () {
        this.Around(function(scenario, runScenario) {
          runScenario('Failure', function(callback) { callback(); });
        });
      };

      module.exports = hooks;
      """
    When I run cucumber.js with `-f json`
    Then it outputs this json:
      """
      [
        {
          "id": "some-feature",
          "name": "some feature",
          "description": "",
          "line": 1,
          "keyword": "Feature",
          "uri": "<current-directory>/features/a.feature",
          "elements": [
            {
              "name": "I've declared one step and it is passing",
              "id": "some-feature;i've-declared-one-step-and-it-is-passing",
              "line": 3,
              "keyword": "Scenario",
              "description": "",
              "type": "scenario",
              "steps": [
                {
                  "keyword": "Around ",
                  "hidden": true,
                  "result": {
                    "error_message": "<error-message>",
                    "duration": "<duration>",
                    "status": "failed"
                  },
                  "match": {}
                },
                {
                  "name": "This step is passing",
                  "line": 4,
                  "keyword": "Given ",
                  "result": {
                    "status": "skipped"
                  },
                  "match": {}
                },
                {
                  "keyword": "Around ",
                  "hidden": true,
                  "result": {
                    "duration": "<duration>",
                    "status": "passed"
                  },
                  "match": {}
                }
              ]
            }
          ]
        }
      ]
      """

  Scenario: Failing around hook (post scenario) fails the scenario
    Given a file named "features/a.feature" with:
      """
      Feature: some feature

      Scenario: I've declared one step and it is passing
          Given This step is passing
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      var cucumberSteps = function() {
        this.Given(/^This step is passing$/, function(callback) { callback(); });
      };
      module.exports = cucumberSteps;
      """
    And a file named "features/support/hooks.js" with:
      """
      var hooks = function () {
        this.Around(function(scenario, runScenario) {
          // no-op

          runScenario(null, function(callback) {
            callback('Fail');
          });
        });
      };

      module.exports = hooks;
      """
    When I run cucumber.js with `-f json`
    Then it outputs this json:
      """
      [
        {
          "id": "some-feature",
          "name": "some feature",
          "description": "",
          "line": 1,
          "keyword": "Feature",
          "uri": "<current-directory>/features/a.feature",
          "elements": [
            {
              "name": "I've declared one step and it is passing",
              "id": "some-feature;i've-declared-one-step-and-it-is-passing",
              "line": 3,
              "keyword": "Scenario",
              "description": "",
              "type": "scenario",
              "steps": [
                {
                  "keyword": "Around ",
                  "hidden": true,
                  "result": {
                    "duration": "<duration>",
                    "status": "passed"
                  },
                  "match": {}
                },
                {
                  "name": "This step is passing",
                  "line": 4,
                  "keyword": "Given ",
                  "result": {
                    "duration": "<duration>",
                    "status": "passed"
                  },
                  "match": {}
                },
                {
                  "keyword": "Around ",
                  "hidden": true,
                  "result": {
                    "error_message": "<error-message>",
                    "duration": "<duration>",
                    "status": "failed"
                  },
                  "match": {}
                }
              ]
            }
          ]
        }
      ]
      """

  Scenario: Failing before hook fails the scenario
    Given a file named "features/a.feature" with:
      """
      Feature: some feature

      Scenario: I've declared one step and it is passing
          Given This step is passing
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      var cucumberSteps = function() {
        this.Given(/^This step is passing$/, function(callback) { callback(); });
      };
      module.exports = cucumberSteps;
      """
    And a file named "features/support/hooks.js" with:
      """
      var hooks = function () {
        this.Before(function(scenario, callback) {
          callback('Fail');
        });
      };

      module.exports = hooks;
      """
    When I run cucumber.js with `-f json`
    Then it outputs this json:
      """
      [
        {
          "id": "some-feature",
          "name": "some feature",
          "description": "",
          "line": 1,
          "keyword": "Feature",
          "uri": "<current-directory>/features/a.feature",
          "elements": [
            {
              "name": "I've declared one step and it is passing",
              "id": "some-feature;i've-declared-one-step-and-it-is-passing",
              "line": 3,
              "keyword": "Scenario",
              "description": "",
              "type": "scenario",
              "steps": [
                {
                  "keyword": "Before ",
                  "hidden": true,
                  "result": {
                    "error_message": "<error-message>",
                    "duration": "<duration>",
                    "status": "failed"
                  },
                  "match": {}
                },
                {
                  "name": "This step is passing",
                  "line": 4,
                  "keyword": "Given ",
                  "result": {
                    "status": "skipped"
                  },
                  "match": {}
                }
              ]
            }
          ]
        }
      ]
      """

  Scenario: Failing after hook fails the scenario
    Given a file named "features/a.feature" with:
      """
      Feature: some feature

      Scenario: I've declared one step and it is passing
          Given This step is passing
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      var cucumberSteps = function() {
        this.Given(/^This step is passing$/, function(callback) { callback(); });
      };
      module.exports = cucumberSteps;
      """
    And a file named "features/support/hooks.js" with:
      """
      var hooks = function () {
        this.After(function(scenario, callback) {
          callback('Fail');
        });
      };

      module.exports = hooks;
      """
    When I run cucumber.js with `-f json`
    Then it outputs this json:
      """
      [
        {
          "id": "some-feature",
          "name": "some feature",
          "description": "",
          "line": 1,
          "keyword": "Feature",
          "uri": "<current-directory>/features/a.feature",
          "elements": [
            {
              "name": "I've declared one step and it is passing",
              "id": "some-feature;i've-declared-one-step-and-it-is-passing",
              "line": 3,
              "keyword": "Scenario",
              "description": "",
              "type": "scenario",
              "steps": [
                {
                  "name": "This step is passing",
                  "line": 4,
                  "keyword": "Given ",
                  "result": {
                    "duration": "<duration>",
                    "status": "passed"
                  },
                  "match": {}
                },
                {
                  "keyword": "After ",
                  "hidden": true,
                  "result": {
                    "error_message": "<error-message>",
                    "duration": "<duration>",
                    "status": "failed"
                  },
                  "match": {}
                }
              ]
            }
          ]
        }
      ]
      """

  Scenario: Hooks still execute after a failure
    Given a file named "features/a.feature" with:
      """
      Feature: some feature

      Scenario: I've declared one step and it is passing
          Given This step is passing
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      var cucumberSteps = function() {
        this.Given(/^This step is passing$/, function(callback) { callback(); });
      };
      module.exports = cucumberSteps;
      """
    And a file named "features/support/hooks.js" with:
      """
      var hooks = function () {
        this.Around(function(scenario, runScenario) {
          runScenario("failure", function(callback) {
            callback();
          });
        });

        this.Around(function(scenario, runScenario) {
          runScenario(null, function(callback) {
            callback();
          });
        });

        this.Before(function(scenario, callback) {
          callback();
        });

        this.After(function(scenario, callback) {
          callback();
        });
      };

      module.exports = hooks;
      """
    When I run cucumber.js with `-f json`
    Then it outputs this json:
      """
      [
        {
          "id": "some-feature",
          "name": "some feature",
          "description": "",
          "line": 1,
          "keyword": "Feature",
          "uri": "<current-directory>/features/a.feature",
          "elements": [
            {
              "name": "I've declared one step and it is passing",
              "id": "some-feature;i've-declared-one-step-and-it-is-passing",
              "line": 3,
              "keyword": "Scenario",
              "description": "",
              "type": "scenario",
              "steps": [
                {
                  "keyword": "Around ",
                  "hidden": true,
                  "result": {
                    "error_message": "<error-message>",
                    "duration": "<duration>",
                    "status": "failed"
                  },
                  "match": {}
                },
                {
                  "keyword": "Around ",
                  "hidden": true,
                  "result": {
                    "duration": "<duration>",
                    "status": "passed"
                  },
                  "match": {}
                },
                {
                  "keyword": "Before ",
                  "hidden": true,
                  "result": {
                    "duration": "<duration>",
                    "status": "passed"
                  },
                  "match": {}
                },
                {
                  "name": "This step is passing",
                  "line": 4,
                  "keyword": "Given ",
                  "result": {
                    "status": "skipped"
                  },
                  "match": {}
                },
                {
                  "keyword": "After ",
                  "hidden": true,
                  "result": {
                    "duration": "<duration>",
                    "status": "passed"
                  },
                  "match": {}
                },
                {
                  "keyword": "Around ",
                  "hidden": true,
                  "result": {
                    "duration": "<duration>",
                    "status": "passed"
                  },
                  "match": {}
                },
                {
                  "keyword": "Around ",
                  "hidden": true,
                  "result": {
                    "duration": "<duration>",
                    "status": "passed"
                  },
                  "match": {}
                }
              ]
            }
          ]
        }
      ]
      """

  Scenario: World is this in hooks
    Given a file named "features/a.feature" with:
      """
      Feature: some feature

      Scenario: I've declared one step and it is passing
          Given This step is passing
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      var cucumberSteps = function() {
        this.Given(/^This step is passing$/, function(callback) { callback(); });
      };
      module.exports = cucumberSteps;
      """
    And a file named "features/support/world.js" with:
      """
      var WorldConstructor = function WorldConstructor() {
        return {
          isWorld: function() { return true; }
        };
      };

      module.exports.World = WorldConstructor;
      """
    And a file named "features/support/hooks.js" with:
      """
      var hooks = function () {
        this.World = require("../support/world.js").World;

        this.Before(function(scenario, callback) {
          var world = this;

          if (!world.isWorld())
            callback("Expected this to be world");
          else
            callback();
        });

        this.After(function(scenario, callback) {
          var world = this;

          if (!world.isWorld())
            callback("Expected this to be world");
          else
            callback();
        });

        this.Around(function(scenario, runScenario) {
          var world = this;
          var error;

          if (!world.isWorld())
            error = "Expected this to be world";
          else
            error = null;

          runScenario(error, function(callback) {
            var world = this;
            var error;

            if (!world.isWorld())
              error = "Expected this to be world";
            else
              error = null;

            callback(error);
          });
        });
      };

      module.exports = hooks;
      """
    When I run cucumber.js with `-f json`
    Then it outputs this json:
      """
      [
        {
          "id": "some-feature",
          "name": "some feature",
          "description": "",
          "line": 1,
          "keyword": "Feature",
          "uri": "<current-directory>/features/a.feature",
          "elements": [
            {
              "name": "I've declared one step and it is passing",
              "id": "some-feature;i've-declared-one-step-and-it-is-passing",
              "line": 3,
              "keyword": "Scenario",
              "description": "",
              "type": "scenario",
              "steps": [
                {
                  "keyword": "Around ",
                  "hidden": true,
                  "result": {
                    "duration": "<duration>",
                    "status": "passed"
                  },
                  "match": {}
                },
                {
                  "keyword": "Before ",
                  "hidden": true,
                  "result": {
                    "duration": "<duration>",
                    "status": "passed"
                  },
                  "match": {}
                },
                {
                  "name": "This step is passing",
                  "line": 4,
                  "keyword": "Given ",
                  "result": {
                    "duration": "<duration>",
                    "status": "passed"
                  },
                  "match": {}
                },
                {
                  "keyword": "After ",
                  "hidden": true,
                  "result": {
                    "duration": "<duration>",
                    "status": "passed"
                  },
                  "match": {}
                },
                {
                  "keyword": "Around ",
                  "hidden": true,
                  "result": {
                    "duration": "<duration>",
                    "status": "passed"
                  },
                  "match": {}
                }
              ]
            }
          ]
        }
      ]
      """
