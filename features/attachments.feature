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
        this.Before(function() {
          this.attach(new Buffer([137, 80, 78, 71]), 'image/png');
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
                    "location": "<current-directory>/features/support/hooks.js:2"
                  },
                  "embeddings": [
                    {
                      "mime_type": "image/png",
                      "data": "iVBORw=="
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
                  "arguments": [],
                  "match": {
                    "location": "<current-directory>/features/step_definitions/cucumber_steps.js:2"
                  }
                }
              ]
            }
          ]
        }
      ]
      """

  Scenario: Attach a stream (callback)
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
      var stream = require('stream');

      var hooks = function () {
        this.Before(function(scenarioResult, callback) {
          var passThroughStream = new stream.PassThrough();
          this.attach(passThroughStream, 'image/png', callback);
          passThroughStream.write(new Buffer([137, 80]));
          passThroughStream.write(new Buffer([78, 71]));
          passThroughStream.end();
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
                    "location": "<current-directory>/features/support/hooks.js:4"
                  },
                  "embeddings": [
                    {
                      "mime_type": "image/png",
                      "data": "iVBORw=="
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
                  "arguments": [],
                  "match": {
                    "location": "<current-directory>/features/step_definitions/cucumber_steps.js:2"
                  }
                }
              ]
            }
          ]
        }
      ]
      """

    Scenario: Attach a stream (promise)
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
        var stream = require('stream');

        var hooks = function () {
          this.Before(function() {
            var passThroughStream = new stream.PassThrough();
            var promise = this.attach(passThroughStream, 'image/png');
            passThroughStream.write(new Buffer([137, 80]));
            passThroughStream.write(new Buffer([78, 71]));
            passThroughStream.end();
            return promise
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
                      "location": "<current-directory>/features/support/hooks.js:4"
                    },
                    "embeddings": [
                      {
                        "mime_type": "image/png",
                        "data": "iVBORw=="
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
                    "arguments": [],
                    "match": {
                      "location": "<current-directory>/features/step_definitions/cucumber_steps.js:2"
                    }
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
        this.Before(function() {
          this.attach("text");
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
                    "location": "<current-directory>/features/support/hooks.js:2"
                  },
                  "embeddings": [
                    {
                      "mime_type": "text/plain",
                      "data": "text"
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
                  "arguments": [],
                  "match": {
                    "location": "<current-directory>/features/step_definitions/cucumber_steps.js:2"
                  }
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
        this.After(function() {
          this.attach("text");
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
                  },
                  "embeddings": [
                    {
                      "mime_type": "text/plain",
                      "data": "text"
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
        this.Given(/^This step is passing$/, function() {
          this.attach("text");
        });
      };
      module.exports = cucumberSteps;
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
                  },
                  "embeddings": [
                    {
                      "mime_type": "text/plain",
                      "data": "text"
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
      """
