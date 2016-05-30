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
        else if (scenario.getException() !== null)
          error = "Expected exception to be null";
        else
          error = null;

        return error;
      }

      var hooks = function () {
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
    When I run cucumber.js with `-f json`
    Then it outputs this json:
      """
      [
        {
          "id": "some-feature",
          "name": "some feature",
          "tags": [],
          "line": 1,
          "keyword": "Feature",
          "uri": "<current-directory>/features/a.feature",
          "elements": [
            {
              "name": "I've declared one step and it is passing",
              "id": "some-feature;i've-declared-one-step-and-it-is-passing",
              "line": 3,
              "keyword": "Scenario",
              "tags": [],
              "type": "scenario",
              "steps": [
                {
                  "keyword": "Before ",
                  "hidden": true,
                  "result": {
                    "duration": "<duration>",
                    "status": "passed"
                  },
                  "arguments": [],
                  "match": {
                    "location": "<current-directory>/features/support/hooks.js:21"
                  }
                },
                {
                  "name": "This step is passing",
                  "line": 4,
                  "keyword": "Given ",
                  "result": {
                    "duration": "<duration>",
                    "status": "passed"
                  },
                  "arguments": [],
                  "match": {
                    "location": "<current-directory>/features/step_definitions/cucumber_steps.js:2"
                  }
                },
                {
                  "keyword": "After ",
                  "hidden": true,
                  "result": {
                    "duration": "<duration>",
                    "status": "passed"
                  },
                  "arguments": [],
                  "match": {
                    "location": "<current-directory>/features/support/hooks.js:27"
                  }
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
          else if (scenario.getException() !== null)
            error = "Expected exception to be null";
          else
            error = null;

          callback(error);
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
          "tags": [],
          "line": 1,
          "keyword": "Feature",
          "uri": "<current-directory>/features/a.feature",
          "elements": [
            {
              "name": "I've declared one step and it is passing",
              "id": "some-feature;i've-declared-one-step-and-it-is-passing",
              "line": 3,
              "keyword": "Scenario",
              "tags": [],
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
                  "arguments": [],
                  "match": {
                    "location": "<current-directory>/features/step_definitions/cucumber_steps.js:2"
                  }
                },
                {
                  "keyword": "After ",
                  "hidden": true,
                  "result": {
                    "duration": "<duration>",
                    "status": "passed"
                  },
                  "arguments": [],
                  "match": {
                    "location": "<current-directory>/features/support/hooks.js:2"
                  }
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
          else if (scenario.getException() !== "Fail")
            error = "Expected exception to be 'Fail'";
          else
            error = null;

          callback(error);
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
          "tags": [],
          "line": 1,
          "keyword": "Feature",
          "uri": "<current-directory>/features/a.feature",
          "elements": [
            {
              "name": "I've declared one step and it is failing",
              "id": "some-feature;i've-declared-one-step-and-it-is-failing",
              "line": 3,
              "keyword": "Scenario",
              "tags": [],
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
                  "arguments": [],
                  "match": {
                    "location": "<current-directory>/features/step_definitions/cucumber_steps.js:2"
                  }
                },
                {
                  "keyword": "After ",
                  "hidden": true,
                  "result": {
                    "duration": "<duration>",
                    "status": "passed"
                  },
                  "arguments": [],
                  "match": {
                    "location": "<current-directory>/features/support/hooks.js:2"
                  }
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
        this.Given(/^This step is pending$/, function(callback) { callback(null, 'pending'); });
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
          else if (scenario.getException() !== null)
            error = "Expected exception to be null";
          else
            error = null;

          callback(error);
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
          "tags": [],
          "line": 1,
          "keyword": "Feature",
          "uri": "<current-directory>/features/a.feature",
          "elements": [
            {
              "name": "I've declared one step and it is pending",
              "id": "some-feature;i've-declared-one-step-and-it-is-pending",
              "line": 3,
              "keyword": "Scenario",
              "tags": [],
              "type": "scenario",
              "steps": [
                {
                  "name": "This step is pending",
                  "line": 4,
                  "keyword": "Given ",
                  "result": {
                    "status": "pending"
                  },
                  "arguments": [],
                  "match": {
                    "location": "<current-directory>/features/step_definitions/cucumber_steps.js:2"
                  }
                },
                {
                  "keyword": "After ",
                  "hidden": true,
                  "result": {
                    "duration": "<duration>",
                    "status": "passed"
                  },
                  "arguments": [],
                  "match": {
                    "location": "<current-directory>/features/support/hooks.js:2"
                  }
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
          else if (scenario.getException() !== null)
            error = "Expected exception to be null";
          else
            error = null;

          callback(error);
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
          "tags": [],
          "line": 1,
          "keyword": "Feature",
          "uri": "<current-directory>/features/a.feature",
          "elements": [
            {
              "name": "I've declared one step and it is undefined",
              "id": "some-feature;i've-declared-one-step-and-it-is-undefined",
              "line": 3,
              "keyword": "Scenario",
              "tags": [],
              "type": "scenario",
              "steps": [
                {
                  "name": "This step is undefined",
                  "line": 4,
                  "keyword": "Given ",
                  "result": {
                    "status": "undefined"
                  },
                  "arguments": []
                },
                {
                  "keyword": "After ",
                  "hidden": true,
                  "result": {
                    "duration": "<duration>",
                    "status": "passed"
                  },
                  "arguments": [],
                  "match": {
                    "location": "<current-directory>/features/support/hooks.js:2"
                  }
                }
              ]
            }
          ]
        }
      ]
      """
