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

        // This should not run
        this.After({tags: ["@foo"]}, function(scenario, callback) {
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
        this.Before(function(scenario, callback) {
          callback('failure');
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
                  "keyword": "Before ",
                  "hidden": true,
                  "result": {
                    "duration": "<duration>",
                    "error_message": "<error-message>",
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
                  "keyword": "After ",
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

      module.exports = function() {
        this.World = WorldConstructor;
      };
      """
    And a file named "features/support/hooks.js" with:
      """
      var hooks = function () {
        this.Before(function(scenario) {
          if (!this.isWorld())
            throw Error("Expected this to be world");
        });

        this.After(function(scenario) {
          if (!this.isWorld())
            throw Error("Expected this to be world");
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
                }
              ]
            }
          ]
        }
      ]
      """
