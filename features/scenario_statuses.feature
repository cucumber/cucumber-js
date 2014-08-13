Feature: Scenario Statuses

  Scenario: Check scenario statuses
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
      function checkScenarioStatuses(scenario) {
        var error;

        if (scenario.isSuccessful() !== true)
          error = "Expected isSuccessful to be true";
        else if (scenario.isFailed() !== false)
          error = "Expected isFailed to be false";
        else if (scenario.isPending() !== false)
          error = "Expected isPending to be false";
        else if (scenario.isUndefined() !== false)
          error = "Expected isUndefined to be false";
        else
          error = null;

        return error;
      }

      var hooks = function () {
        this.Around(function(scenario, runScenario) {
          var error = checkScenarioStatuses(scenario);

          runScenario(error, function(callback) {
            var error = checkScenarioStatuses(scenario);

            callback(error);
          });
        });

        this.Before(function(scenario, callback) {
          var error = checkScenarioStatuses(scenario);

          callback(error);
        });

        this.After(function(scenario, callback) {
          var error = checkScenarioStatuses(scenario);

          callback(error);
        });
      };

      module.exports = hooks;
      """
    When I run `cucumber.js -f json`
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

  Scenario: Success status
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
          if (scenario.isSuccessful() !== true)
            error = "Expected isSuccessful to be true";
          else if (scenario.isFailed() !== false)
            error = "Expected isFailed to be false";
          else if (scenario.isPending() !== false)
            error = "Expected isPending to be false";
          else if (scenario.isUndefined() !== false)
            error = "Expected isUndefined to be false";
          else
            error = null;

          callback(error);
        });
      };

      module.exports = hooks;
      """
    When I run `cucumber.js -f json`
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

  Scenario: Failed status
    Given a file named "features/a.feature" with:
      """
      Feature: some feature

      Scenario: I've declared one step and it is failing
          Given This step is failing
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      var cucumberSteps = function() {
        this.Given(/^This step is failing$/, function(callback) { callback("Fail"); });
      };
      module.exports = cucumberSteps;
      """
    And a file named "features/support/hooks.js" with:
      """
      var hooks = function () {
        this.After(function(scenario, callback) {
          if (scenario.isSuccessful() !== false)
            error = "Expected isSuccessful to be false";
          else if (scenario.isFailed() !== true)
            error = "Expected isFailed to be true";
          else if (scenario.isPending() !== false)
            error = "Expected isPending to be false";
          else if (scenario.isUndefined() !== false)
            error = "Expected isUndefined to be false";
          else
            error = null;

          callback(error);
        });
      };

      module.exports = hooks;
      """
    When I run `cucumber.js -f json`
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
              "name": "I've declared one step and it is failing",
              "id": "some-feature;i've-declared-one-step-and-it-is-failing",
              "line": 3,
              "keyword": "Scenario",
              "description": "",
              "type": "scenario",
              "steps": [
                {
                  "name": "This step is failing",
                  "line": 4,
                  "keyword": "Given ",
                  "result": {
                    "error_message": "<error_message>",
                    "duration": "<duration>",
                    "status": "failed"
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

  Scenario: Pending status
    Given a file named "features/a.feature" with:
      """
      Feature: some feature

      Scenario: I've declared one step and it is pending
          Given This step is pending
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      var cucumberSteps = function() {
        this.Given(/^This step is pending$/, function(callback) { callback.pending(); });
      };
      module.exports = cucumberSteps;
      """
    And a file named "features/support/hooks.js" with:
      """
      var hooks = function () {
        this.After(function(scenario, callback) {
          if (scenario.isSuccessful() !== false)
            error = "Expected isSuccessful to be false";
          else if (scenario.isFailed() !== false)
            error = "Expected isFailed to be false";
          else if (scenario.isPending() !== true)
            error = "Expected isPending to be true";
          else if (scenario.isUndefined() !== false)
            error = "Expected isUndefined to be false";
          else
            error = null;

          callback(error);
        });
      };

      module.exports = hooks;
      """
    When I run `cucumber.js -f json`
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
              "name": "I've declared one step and it is pending",
              "id": "some-feature;i've-declared-one-step-and-it-is-pending",
              "line": 3,
              "keyword": "Scenario",
              "description": "",
              "type": "scenario",
              "steps": [
                {
                  "name": "This step is pending",
                  "line": 4,
                  "keyword": "Given ",
                  "result": {
                    "status": "pending"
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

  Scenario: Undefined status
    Given a file named "features/a.feature" with:
      """
      Feature: some feature

      Scenario: I've declared one step and it is undefined
          Given This step is undefined
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      var cucumberSteps = function() {
      };
      module.exports = cucumberSteps;
      """
    And a file named "features/support/hooks.js" with:
      """
      var hooks = function () {
        this.After(function(scenario, callback) {
          if (scenario.isSuccessful() !== false)
            error = "Expected isSuccessful to be false";
          else if (scenario.isFailed() !== false)
            error = "Expected isFailed to be false";
          else if (scenario.isPending() !== false)
            error = "Expected isPending to be false";
          else if (scenario.isUndefined() !== true)
            error = "Expected isUndefined to be true";
          else
            error = null;

          callback(error);
        });
      };

      module.exports = hooks;
      """
    When I run `cucumber.js -f json`
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
              "name": "I've declared one step and it is undefined",
              "id": "some-feature;i've-declared-one-step-and-it-is-undefined",
              "line": 3,
              "keyword": "Scenario",
              "description": "",
              "type": "scenario",
              "steps": [
                {
                  "name": "This step is undefined",
                  "line": 4,
                  "keyword": "Given ",
                  "result": {
                    "status": "undefined"
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

  Scenario: Simultaneous statuses
    Given a file named "features/a.feature" with:
      """
      Feature: some feature

      Scenario: I've declared one step and it is undefined
          Given This step is pending
          And This step is undefined
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      var cucumberSteps = function() {
        this.Given(/^This step is pending$/, function(callback) { callback.pending(); });
      };
      module.exports = cucumberSteps;
      """
    And a file named "features/support/hooks.js" with:
      """
      var hooks = function () {
        this.After(function(scenario, callback) {
          if (scenario.isSuccessful() !== false)
            error = "Expected isSuccessful to be false";
          else if (scenario.isFailed() !== true)
            error = "Expected isFailed to be true";
          else if (scenario.isPending() !== true)
            error = "Expected isPending to be true";
          else if (scenario.isUndefined() !== true)
            error = "Expected isUndefined to be true";
          else
            error = null;

          callback(error);
        });

        this.After(function(scenario, callback) {
          callback("fail");
        });
      };

      module.exports = hooks;
      """
    When I run `cucumber.js -f json`
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
              "name": "I've declared one step and it is undefined",
              "id": "some-feature;i've-declared-one-step-and-it-is-undefined",
              "line": 3,
              "keyword": "Scenario",
              "description": "",
              "type": "scenario",
              "steps": [
                {
                  "name": "This step is pending",
                  "line": 4,
                  "keyword": "Given ",
                  "result": {
                    "status": "pending"
                  },
                  "match": {}
                },
                {
                  "name": "This step is undefined",
                  "line": 5,
                  "keyword": "And ",
                  "result": {
                    "status": "undefined"
                  },
                  "match": {}
                },
                {
                  "keyword": "After ",
                  "hidden": true,
                  "result": {
                    "error_message": "fail",
                    "duration": 351161,
                    "status": "failed"
                  },
                  "match": {}
                },
                {
                  "keyword": "After ",
                  "hidden": true,
                  "result": {
                    "duration": 319244,
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
