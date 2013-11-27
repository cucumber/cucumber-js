Feature: JSON Formatter
 In order to simplify processing of Cucumber features and results
 Developers should be able to consume features as JSON

  Scenario: output JSON for a feature with no scenarios
    Given a file named "features/a.feature" with:
      """
      Feature: some feature
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
          "uri": "<current-directory>/features/a.feature"
        }
      ]
      """

  Scenario: output JSON for a feature with one undefined scenario
    Given a file named "features/a.feature" with:
      """
      Feature: some feature

      Scenario: I havn't done anything yet
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
              "name": "I havn't done anything yet",
              "id": "some-feature;i-havn't-done-anything-yet",
              "line": 3,
              "keyword": "Scenario",
              "description": "",
              "type": "scenario"
            }
          ]
        }
      ]
      """

  Scenario: output JSON for a feature with one scenario with one undefined step
    Given a file named "features/a.feature" with:
      """
      Feature: some feature

      Scenario: I've declared one step but not yet defined it
          Given I have not defined this step
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
          "uri":"<current-directory>/features/a.feature",
          "elements": [
            {
              "name": "I've declared one step but not yet defined it",
              "id": "some-feature;i've-declared-one-step-but-not-yet-defined-it",
              "line": 3,
              "keyword": "Scenario",
              "description": "",
              "type": "scenario",
              "steps": [
                {
                  "name":"I have not defined this step",
                  "line":4,
                  "keyword":"Given ",
                  "result":
                  {
                    "status":"undefined"
                  },
                  "match": {}
                }
              ]
            }
          ]
        }
      ]
      """

  Scenario: output JSON for a feature with one undefined step and subsequent defined steps which should be skipped
    Given a file named "features/a.feature" with:
      """
      Feature: some feature

      Scenario: One pending step and two following steps which will be skipped
          Given This step is undefined
          Then this step should be skipped

      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      var cucumberSteps = function() {
        this.Then(/^this step should be skipped$/, function(callback) { callback(); });
      };
      module.exports = cucumberSteps;
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
              "name": "One pending step and two following steps which will be skipped",
              "id": "some-feature;one-pending-step-and-two-following-steps-which-will-be-skipped",
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
                  "match": {
                  }
                },
                {
                  "name": "this step should be skipped",
                  "line": 5,
                  "keyword": "Then ",
                  "result": {
                    "status": "skipped"
                  },
                  "match": {
                  }
                }
              ]
            }
          ]
        }
      ]
      """

  Scenario: output JSON for a feature with one scenario with one pending step
    Given a file named "features/a.feature" with:
      """
      Feature: some feature

      Scenario: I've declared one step which is pending
          Given This step is pending
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      var cucumberSteps = function() {
        this.Given(/^This step is pending$/, function(callback) { callback.pending(); });
      };
      module.exports = cucumberSteps;
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
          "uri":"<current-directory>/features/a.feature",
          "elements": [
            {
              "name": "I've declared one step which is pending",
              "id": "some-feature;i've-declared-one-step-which-is-pending",
              "line": 3,
              "keyword": "Scenario",
              "description": "",
              "type": "scenario",
              "steps": [
                {
                  "name": "This step is pending",
                  "line": 4,
                  "keyword": "Given ",
                  "result": { "status": "pending" },
                  "match": {
                  }
                }
              ]
            }
          ]
        }
      ]
      """

  @wip
  Scenario: output JSON for a feature with one scenario with failing step
    Given a file named "features/a.feature" with:
      """
      Feature: some feature

      Scenario: I've declared one step but it is failing
          Given This step is failing
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      var cucumberSteps = function() {
        this.Given(/^This step is failing$/, function(callback) { callback.fail(); });
      };
      module.exports = cucumberSteps;
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
          "uri":"<current-directory>/features/a.feature",
          "elements": [
            {
              "name": "I've declared one step but it is failing",
              "id": "some-feature;i've-declared-one-step-but-it-is-failing",
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
                    "error_message": "<error-message>",
                    "duration": "<duration>",
                    "status": "failed"
                  },
                  "match": {
                  }
                }
              ]
            }
          ]
        }
      ]
      """

  Scenario: output JSON for a feature with one scenario with passing step
    Given a file named "features/a.feature" with:
      """
      Feature: some feature

      Scenario: I've declared one step which passes
          Given This step is passing
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      var cucumberSteps = function() {
        this.Given(/^This step is passing$/, function(callback) { callback(); });
      };
      module.exports = cucumberSteps;
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
          "uri":"<current-directory>/features/a.feature",
          "elements": [
            {
              "name": "I've declared one step which passes",
              "id": "some-feature;i've-declared-one-step-which-passes",
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
                  "match": {
                  }
                }
              ]
            }
          ]
        }
      ]
      """

  Scenario: output JSON for a scenario with a passing step follwed by one that is pending and one that fails
    Given a file named "features/a.feature" with:
      """
      Feature: some feature

      Scenario: I've declared one step which is passing, one pending and one failing.
          Given This step is passing
          And This step is pending
          And This step fails but will be skipped
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      var cucumberSteps = function() {
        this.Given(/^This step is passing$/, function(callback) { callback(); });
        this.Given(/^This step is pending$/, function(callback) { callback.pending(); });
        this.Given(/^This step fails but will be skipped$/, function(callback) { callback.fail(); });
      };
      module.exports = cucumberSteps;
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
              "name": "I've declared one step which is passing, one pending and one failing.",
              "id": "some-feature;i've-declared-one-step-which-is-passing,-one-pending-and-one-failing.",
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
                  "name": "This step is pending",
                  "line": 5,
                  "keyword": "And ",
                  "result": {
                    "status": "pending"
                  },
                  "match": {}
                },
                {
                  "name": "This step fails but will be skipped",
                  "line": 6,
                  "keyword": "And ",
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

  Scenario: output JSON for a scenario with a pending step follwed by one that passes and one that fails
    Given a file named "features/a.feature" with:
      """
     Feature: some feature

      Scenario: I've declared one step which is passing, one pending and one failing.
          Given This step is pending
          And This step is passing but will be skipped
          And This step fails but will be skipped
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      var cucumberSteps = function() {
        this.Given(/^This step is pending$/, function(callback) { callback.pending(); });
        this.Given(/^This step is passing but will be skipped$/, function(callback) { callback(); });
        this.Given(/^This step fails but will be skipped$/, function(callback) { callback.fail(); });
      };
      module.exports = cucumberSteps;
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
              "name": "I've declared one step which is passing, one pending and one failing.",
              "id": "some-feature;i've-declared-one-step-which-is-passing,-one-pending-and-one-failing.",
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
                  "match": {
                  }
                },
                {
                  "name": "This step is passing but will be skipped",
                  "line": 5,
                  "keyword": "And ",
                  "result": {
                    "status": "skipped"
                  },
                  "match": {
                  }
                },
                {
                  "name": "This step fails but will be skipped",
                  "line": 6,
                  "keyword": "And ",
                  "result": {
                    "status": "skipped"
                  },
                  "match": {
                  }
                }
              ]
            }
          ]
        }
      ]
      """

  Scenario: output JSON for one feature, one passing scenario, one failing scenario
    Given a file named "features/a.feature" with:
      """
      Feature: one passes one fails

      Scenario: This one passes
        Given This step is passing
      Scenario: This one fails
        Given This step is failing
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      var cucumberSteps = function() {
        this.Given(/^This step is passing$/, function(callback) { callback(); });
        this.Given(/^This step is failing$/, function(callback) { callback.fail(); });
      };
      module.exports = cucumberSteps;
      """
    When I run `cucumber.js -f json`
    Then it outputs this json:
      """
      [
        {
          "id": "one-passes one fails",
          "name": "one passes one fails",
          "description": "",
          "line": 1,
          "keyword": "Feature",
          "uri": "<current-directory>/features/a.feature",
          "elements": [
            {
              "name": "This one passes",
              "id": "one-passes one fails;this-one-passes",
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
                  "match": {
                  }
                }
              ]
            },
            {
              "name": "This one fails",
              "id": "one-passes one fails;this-one-fails",
              "line": 5,
              "keyword": "Scenario",
              "description": "",
              "type": "scenario",
              "steps": [
                {
                  "name": "This step is failing",
                  "line": 6,
                  "keyword": "Given ",
                  "result": {
                    "error_message": "<error-message>",
                    "duration": "<duration>",
                    "status": "failed"
                  },
                  "match": {
                  }
                }
              ]
            }
          ]
        }
      ]
      """
  Scenario: output JSON for multiple features
    Given a file named "features/a.feature" with:
      """
     Feature: feature a

      Scenario: This is the first feature
          Given This step is passing
      """
    And a file named "features/b.feature" with:
      """
     Feature: feature b

      Scenario: This is the second feature
          Given This step is passing
      """
    And a file named "features/c.feature" with:
      """
     Feature: feature c

      Scenario: This is the third feature
          Given This step is passing
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      var cucumberSteps = function() {
        this.Given(/^This step is passing$/, function(callback) { callback(); });
      };
      module.exports = cucumberSteps;
      """
    When I run `cucumber.js -f json features/a.feature features/b.feature features/c.feature`
    Then it outputs this json:
      """
      [
        {
          "id": "feature-a",
          "name": "feature a",
          "description": "",
          "line": 1,
          "keyword": "Feature",
          "uri": "<current-directory>/features/a.feature",
          "elements": [
            {
              "name": "This is the first feature",
              "id": "feature-a;this-is-the-first-feature",
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
                  "match": {
                  }
                }
              ]
            }
          ]
        },
        {
          "id": "feature-b",
          "name": "feature b",
          "description": "",
          "line": 1,
          "keyword": "Feature",
          "uri": "<current-directory>/features/b.feature",
          "elements": [
            {
              "name": "This is the second feature",
              "id": "feature-b;this-is-the-second-feature",
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
                }
              ]
            }
          ]
        },
        {
          "id": "feature-c",
          "name": "feature c",
          "description": "",
          "line": 1,
          "keyword": "Feature",
          "uri": "<current-directory>/features/c.feature",
          "elements": [
            {
              "name": "This is the third feature",
              "id": "feature-c;this-is-the-third-feature",
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
                }
              ]
            }
          ]
        }
      ]
      """
  Scenario: output JSON for multiple features each with multiple scenarios
    Given a file named "features/a.feature" with:
      """
     Feature: feature a

      Scenario: This is the feature a scenario one
          Given This step is passing

      Scenario: This is the feature a scenario two
          Given This step is passing

      Scenario: This is the feature a scenario three
          Given This step is passing
      """
    And a file named "features/b.feature" with:
      """
     Feature: feature b

      Scenario: This is the feature b scenario one
          Given This step is passing

      Scenario: This is the feature b scenario two
          Given This step is passing

      Scenario: This is the feature b scenario three
          Given This step is passing
      """
    And a file named "features/c.feature" with:
      """
     Feature: feature c

      Scenario: This is the feature c scenario one
          Given This step is passing

      Scenario: This is the feature c scenario two
          Given This step is passing

      Scenario: This is the feature c scenario three
          Given This step is passing
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      var cucumberSteps = function() {
        this.Given(/^This step is passing$/, function(callback) { callback(); });
      };
      module.exports = cucumberSteps;
      """
    When I run `cucumber.js -f json features/a.feature features/b.feature features/c.feature`
    Then it outputs this json:
      """
      [
        {
          "id": "feature-a",
          "name": "feature a",
          "description": "",
          "line": 1,
          "keyword": "Feature",
          "uri": "<current-directory>/features/a.feature",
          "elements": [
            {
              "name": "This is the feature a scenario one",
              "id": "feature-a;this-is-the-feature-a-scenario-one",
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
                  "match": {
                  }
                }
              ]
            },
            {
              "name": "This is the feature a scenario two",
              "id": "feature-a;this-is-the-feature-a-scenario-two",
              "line": 6,
              "keyword": "Scenario",
              "description": "",
              "type": "scenario",
              "steps": [
                {
                  "name": "This step is passing",
                  "line": 7,
                  "keyword": "Given ",
                  "result": {
                    "duration": "<duration>",
                    "status": "passed"
                  },
                  "match": {}
                }
              ]
            },
            {
              "name": "This is the feature a scenario three",
              "id": "feature-a;this-is-the-feature-a-scenario-three",
              "line": 9,
              "keyword": "Scenario",
              "description": "",
              "type": "scenario",
              "steps": [
                {
                  "name": "This step is passing",
                  "line": 10,
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
        },
        {
          "id": "feature-b",
          "name": "feature b",
          "description": "",
          "line": 1,
          "keyword": "Feature",
          "uri": "<current-directory>/features/b.feature",
          "elements": [
            {
              "name": "This is the feature b scenario one",
              "id": "feature-b;this-is-the-feature-b-scenario-one",
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
                }
              ]
            },
            {
              "name": "This is the feature b scenario two",
              "id": "feature-b;this-is-the-feature-b-scenario-two",
              "line": 6,
              "keyword": "Scenario",
              "description": "",
              "type": "scenario",
              "steps": [
                {
                  "name": "This step is passing",
                  "line": 7,
                  "keyword": "Given ",
                  "result": {
                    "duration": "<duration>",
                    "status": "passed"
                  },
                  "match": {}
                }
              ]
            },
            {
              "name": "This is the feature b scenario three",
              "id": "feature-b;this-is-the-feature-b-scenario-three",
              "line": 9,
              "keyword": "Scenario",
              "description": "",
              "type": "scenario",
              "steps": [
                {
                  "name": "This step is passing",
                  "line": 10,
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
        },
        {
          "id": "feature-c",
          "name": "feature c",
          "description": "",
          "line": 1,
          "keyword": "Feature",
          "uri": "<current-directory>/features/c.feature",
          "elements": [
            {
              "name": "This is the feature c scenario one",
              "id": "feature-c;this-is-the-feature-c-scenario-one",
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
                }
              ]
            },
            {
              "name": "This is the feature c scenario two",
              "id": "feature-c;this-is-the-feature-c-scenario-two",
              "line": 6,
              "keyword": "Scenario",
              "description": "",
              "type": "scenario",
              "steps": [
                {
                  "name": "This step is passing",
                  "line": 7,
                  "keyword": "Given ",
                  "result": {
                    "duration": "<duration>",
                    "status": "passed"
                  },
                  "match": {}
                }
              ]
            },
            {
              "name": "This is the feature c scenario three",
              "id": "feature-c;this-is-the-feature-c-scenario-three",
              "line": 9,
              "keyword": "Scenario",
              "description": "",
              "type": "scenario",
              "steps": [
                {
                  "name": "This step is passing",
                  "line": 10,
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

  Scenario: output JSON for a feature with a background
    Given a file named "features/a.feature" with:
      """
      Feature: some feature

      Background:
          Given This applies to all scenarios
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      var cucumberSteps = function() {
        this.Given(/^This applies to all scenarios$/, function(callback) { callback(); });
      };
      module.exports = cucumberSteps;
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
              "name": "",
              "keyword": "Background",
              "description": "",
              "type": "background",
              "line": 3,
              "steps": [
                {
                  "name": "This applies to all scenarios",
                  "line": 4,
                  "keyword": "Given "
                }
              ]
            }
          ]
        }
      ]
      """

  Scenario: output JSON for a feature with a failing background

    Since the background step is re-evaluated for each scenario that
    is where the result of the step is currently recorded in the JSON
    output.

    If the background is being re-evaluated for each scenario then it
    would be misleading to only output the result for the first time
    it was evaluated.

    Given a file named "features/a.feature" with:
      """
      Feature: some feature

      Background:
          Given This applies to all scenarios but fails
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      var cucumberSteps = function() {
        this.Given(/^This applies to all scenarios but fails$/, function(callback) { callback.fail(); });
      };
      module.exports = cucumberSteps;
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
              "name": "",
              "keyword": "Background",
              "description": "",
              "type": "background",
              "line": 3,
              "steps": [
                {
                  "name": "This applies to all scenarios but fails",
                  "line": 4,
                  "keyword": "Given "
                }
              ]
            }
          ]
        }
      ]
      """

  Scenario: output JSON for a feature with a DocString
    Given a file named "features/a.feature" with:
      """
      Feature: some feature

      Scenario: Scenario with DocString
        Given we have this DocString:
        \"\"\"
        This is a DocString
        \"\"\"
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      var cucumberSteps = function() {
        this.Given(/^we have this DocString:$/, function(string, callback) { callback(); });
      };
      module.exports = cucumberSteps;
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
              "name": "Scenario with DocString",
              "id": "some-feature;scenario-with-docstring",
              "line": 3,
              "keyword": "Scenario",
              "description": "",
              "type": "scenario",
              "steps": [
                {
                  "name": "we have this DocString:",
                  "line": 4,
                  "keyword": "Given ",
                  "doc_string":
                    {
                      "value": "This is a DocString",
                      "line": 5,
                      "content_type": ""
                    },
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

  Scenario: output JSON for background step with a DocString
    Given a file named "features/a.feature" with:
      """
            Feature: some feature

            Background: Background with DocString
              Given we have this DocString:
              \"\"\"
              This is a DocString
              \"\"\"
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      var cucumberSteps = function() {
        this.Given(/^we have this DocString:$/, function(string, callback) { callback(); });
      };
      module.exports = cucumberSteps;
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
            "name": "Background with DocString",
            "keyword": "Background",
            "description": "",
            "type": "background",
            "line": 3,
            "steps": [
              {
                "name": "we have this DocString:",
                "line": 4,
                "keyword": "Given ",
                "doc_string": {
                  "value": "This is a DocString",
                  "line": 5,
                  "content_type": ""
                }
              }
            ]
          }
        ]
      }
    ]
    """

  Scenario: output JSON for a feature with tags
    Given a file named "features/a.feature" with:
      """
      @alpha @beta @gamma
      Feature: some feature

      Scenario: This scenario has no tags
          Given This step is passing
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      var cucumberSteps = function() {
        this.Given(/^This step is passing$/, function(callback) { callback(); });
      };
      module.exports = cucumberSteps;
      """
    When I run `cucumber.js -f json`
    Then it outputs this json:
      """
      [
        {
          "id": "some-feature",
          "name": "some feature",
          "description": "",
          "line": 2,
          "keyword": "Feature",
          "tags": [
            {
              "name": "@alpha",
              "line": 1
            },
            {
              "name": "@beta",
              "line": 1
            },
            {
              "name": "@gamma",
              "line": 1
            }
          ],
          "uri": "<current-directory>/features/a.feature",
          "elements": [
            {
              "name": "This scenario has no tags",
              "id": "some-feature;this-scenario-has-no-tags",
              "line": 4,
              "keyword": "Scenario",
              "description": "",
              "type": "scenario",
              "steps": [
                {
                  "name": "This step is passing",
                  "line": 5,
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

  Scenario: output JSON for scenario with tags
    Given a file named "features/a.feature" with:
      """
      Feature: some feature

      @one @two @three
      Scenario: This scenario has tags
          Given This step is passing
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      var cucumberSteps = function() {
        this.Given(/^This step is passing$/, function(callback) { callback(); });
      };
      module.exports = cucumberSteps;
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
              "name": "This scenario has tags",
              "id": "some-feature;this-scenario-has-tags",
              "line": 4,
              "keyword": "Scenario",
              "description": "",
              "type": "scenario",
              "tags": [
                {
                  "name": "@one",
                  "line": 3
                },
                {
                  "name": "@two",
                  "line": 3
                },
                {
                  "name": "@three",
                  "line": 3
                }
              ],
              "steps": [
                {
                  "name": "This step is passing",
                  "line": 5,
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

  Scenario: output JSON for a step with table

    Rows do not appear to support line attribute yet.

    Given a file named "features/a.feature" with:
      """
      Feature: some feature

      Scenario: This scenario contains a step with a table
          Given This table:
          |col 1|col 2|col 3|
          |one  |two  |three|
          |1    |2    |3    |
          |!    |~    |@    |
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      var cucumberSteps = function() {
        this.Given(/^This table:$/, function(table, callback) { callback(); });
      };
      module.exports = cucumberSteps;
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
              "name": "This scenario contains a step with a table",
              "id": "some-feature;this-scenario-contains-a-step-with-a-table",
              "line": 3,
              "keyword": "Scenario",
              "description": "",
              "type": "scenario",
              "steps": [
                {
                  "name": "This table:",
                  "line": 4,
                  "keyword": "Given ",
                  "rows": [
                    { "cells": ["col 1", "col 2", "col 3" ] },
                    { "cells": ["one", "two", "three"] },
                    { "cells": ["1", "2", "3"] },
                    { "cells": ["!", "~", "@"] }
                  ],
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

  Scenario: output JSON for background with table

    Rows do not appear to support line attribute yet.

    Given a file named "features/a.feature" with:
      """
      Feature: some feature

      Background:
        Given This table:
          |col 1|col 2|col 3|
          |one  |two  |three|
          |1    |2    |3    |
          |!    |~    |@    |
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      var cucumberSteps = function() {
        this.Given(/^This table:$/, function(table, callback) { callback(); });
      };
      module.exports = cucumberSteps;
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
              "name": "",
              "keyword": "Background",
              "description": "",
              "type": "background",
              "line": 3,
              "steps": [
                {
                  "name": "This table:",
                  "line": 4,
                  "keyword": "Given ",
                  "rows": [
                    { "cells": ["col 1", "col 2", "col 3"] },
                    { "cells": ["one", "two", "three"] },
                    { "cells": ["1", "2", "3"] },
                    { "cells": ["!", "~", "@"] }
                  ]
                }
              ]
            }
          ]
        }
      ]
      """
