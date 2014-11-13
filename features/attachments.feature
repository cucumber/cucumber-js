Feature: Attachments

  Scenario: Attach a buffer
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
          scenario.attach(new Buffer([100, 97, 116, 97]), 'image/png');
          callback();
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
                  "keyword": "Before ",
                  "hidden": true,
                  "result": {
                    "duration": "<duration>",
                    "status": "passed"
                  },
                  "match": {},
                  "embeddings": [
                    {
                      "mime_type": "image/png",
                      "data": "ZGF0YQ=="
                    }
                  ]
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
                }
              ]
            }
          ]
        }
      ]
      """

  Scenario: Attach a stream
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
          var Stream = require('stream');
          var versionParts = /v(\d+)\.(\d+)\.(\d+)/.exec(process.version);
          var major = parseInt(versionParts[0], 10);
          var minor = parseInt(versionParts[1], 10);

          if (major > 0 || minor >= 10) {
            var stream = new Stream.Readable();
            stream._read = function() {};
            stream.push(new Buffer([100, 97, 116, 97]));
            stream.push(null);

            scenario.attach(stream, 'image/png', function(error) {
              callback(error);
            });
          }
          else {
            scenario.attach(new Buffer([100, 97, 116, 97]), 'image/png');
            callback();
          }
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
                  "keyword": "Before ",
                  "hidden": true,
                  "result": {
                    "duration": "<duration>",
                    "status": "passed"
                  },
                  "match": {},
                  "embeddings": [
                    {
                      "mime_type": "image/png",
                      "data": "ZGF0YQ=="
                    }
                  ]
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
                }
              ]
            }
          ]
        }
      ]
      """

  Scenario: Attach from an around hook (pre scenario)
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
          scenario.attach("text");

          runScenario(function(scenario, callback) {
            callback();
          });
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
                  "match": {},
                  "embeddings": [
                    {
                      "mime_type": "text/plain",
                      "data": "dGV4dA=="
                    }
                  ]
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

  Scenario: Attach from an around hook (post scenario)
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
          runScenario(function(callback) {
            scenario.attach("text");
            callback();
          });
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
                    "duration": "<duration>",
                    "status": "passed"
                  },
                  "match": {},
                  "embeddings": [
                    {
                      "mime_type": "text/plain",
                      "data": "dGV4dA=="
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
      """

  Scenario: Attach from a before hook
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
          scenario.attach("text");
          callback();
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
                  "keyword": "Before ",
                  "hidden": true,
                  "result": {
                    "duration": "<duration>",
                    "status": "passed"
                  },
                  "match": {},
                  "embeddings": [
                    {
                      "mime_type": "text/plain",
                      "data": "dGV4dA=="
                    }
                  ]
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
                }
              ]
            }
          ]
        }
      ]
      """

  Scenario: Attach from an after hook
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
          scenario.attach("text");
          callback();
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
                  "match": {},
                  "embeddings": [
                    {
                      "mime_type": "text/plain",
                      "data": "dGV4dA=="
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
      """
  Scenario: Attach from a step definition
    Given a file named "features/a.feature" with:
      """
      Feature: some feature

      Scenario: I've declared one step and it is passing
          Given This step is passing
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      var cucumberSteps = function() {
        this.Given(/^This step is passing$/, function(callback) {
          var world = this;
          world.scenario.attach("text");
          callback();
        });
      };
      module.exports = cucumberSteps;
      """
    And a file named "features/support/hooks.js" with:
      """
      var hooks = function () {
        this.Before(function(scenario, callback) {
          var world = this;
          world.scenario = scenario;
          callback();
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
                  "match": {},
                  "embeddings": [
                    {
                      "mime_type": "text/plain",
                      "data": "dGV4dA=="
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
      """
