 Feature: JSON Formatter
   In order to simplify processing of Cucumber features and results
   Developers should be able to consume features as JSON

   Background:
     Given CUCUMBER_JS_HOME environment variable has been set to the cucumber-js install dir

   Scenario: output JSON for a feature with no scenarios
     Given a file named "features/a.feature" with:
       """
       Feature: some feature
       """
     When I run `cucumber.js -f json`
     Then it should output this json:
       """
       [
         {"id":"some-feature",
          "name":"some feature",
          "description":"",
          "line":1,
          "keyword":"Feature",
          "uri":"$CUCUMBER_JS_HOME/tmp/cucumber-js-sandbox/features/a.feature"
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
    Then it should output this json:
      """
      [
        {
         "id":"some-feature",
         "name":"some feature",
         "description":"",
         "line":1,
         "keyword":"Feature",
         "uri":"$CUCUMBER_JS_HOME/tmp/cucumber-js-sandbox/features/a.feature",
         "elements":[
           {"name":"I havn't done anything yet",
            "id":"some-feature;i-havn't-done-anything-yet",
            "line":3,
            "keyword":"Scenario",
            "description":"",
            "type":"scenario" 
           }
          ]
        }
      ]
      """

  Scenario: output JSON for a feature with one scenario with one undefined step
    Given a file named "features/a.feature" with:
      """
      Feature: some feature

      Scenario: I've declaired one step but not yet defined it
          Given I have not defined this step
      """
    When I run `cucumber.js -f json`
    Then it should output this json:
      """
      [
        {
          "id": "some-feature",
          "name": "some feature",
          "description": "",
          "line": 1,
          "keyword": "Feature",
          "uri":"$CUCUMBER_JS_HOME/tmp/cucumber-js-sandbox/features/a.feature",
          "elements": [
            {
              "name": "I've declaired one step but not yet defined it",
              "id": "some-feature;i've-declaired-one-step-but-not-yet-defined-it",
              "line": 3,
              "keyword": "Scenario",
              "description": "",
              "type": "scenario",
              "steps":[
                {"name":"I have not defined this step",
                 "line":4,
                 "keyword":"Given ",
                 "result":
                  {"status":"undefined"
                  },
                 "match":
                  {"location":"TODO"
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

      Scenario: I've declaired one step which is pending
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
    Then it should output this json:
      """
      [
          {
              "id": "some-feature",
              "name": "some feature",
              "description": "",
              "line": 1,
              "keyword": "Feature",
              "uri":"$CUCUMBER_JS_HOME/tmp/cucumber-js-sandbox/features/a.feature",
              "elements": [
                  {
                      "name": "I've declaired one step which is pending",
                      "id": "some-feature;i've-declaired-one-step-which-is-pending",
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
                                  "error_message": "TODO",
                                  "status": "pending"
                              },
                              "match": {
                                  "location": "TODO"
                              }
                          }
                      ]
                  }
              ]
          }
      ]
      """
  Scenario: output JSON for a feature with one scenario with failing step
    Given a file named "features/a.feature" with:
      """
      Feature: some feature

      Scenario: I've declaired one step but it is failing
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
    Then it should output this json:
      """
      [
        {
          "id": "some-feature",
          "name": "some feature",
          "description": "",
          "line": 1,
          "keyword": "Feature",
          "uri":"$CUCUMBER_JS_HOME/tmp/cucumber-js-sandbox/features/a.feature",
          "elements": [
            {
              "name": "I've declaired one step but it is failing",
              "id": "some-feature;i've-declaired-one-step-but-it-is-failing",
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
                  "error_message": "Error: Step failure\n    at Function.fail ($CUCUMBER_JS_HOME/lib/cucumber/support_code/step_definition.js:41:49)\n    at World.<anonymous> ($CUCUMBER_JS_HOME/tmp/cucumber-js-sandbox/features/step_definitions/cucumber_steps.js:2:70)\n    at Object.invoke ($CUCUMBER_JS_HOME/lib/cucumber/support_code/step_definition.js:52:14)\n    at Object.execute ($CUCUMBER_JS_HOME/lib/cucumber/ast/step.js:157:22)\n    at Object.acceptVisitor ($CUCUMBER_JS_HOME/lib/cucumber/ast/step.js:149:12)\n    at Object.executeStep ($CUCUMBER_JS_HOME/lib/cucumber/runtime/ast_tree_walker.js:170:12)\n    at Object.processStep ($CUCUMBER_JS_HOME/lib/cucumber/runtime/ast_tree_walker.js:165:14)\n    at $CUCUMBER_JS_HOME/lib/cucumber/runtime/ast_tree_walker.js:67:16\n    at callUserFunctionAndBroadcastAfterEvent ($CUCUMBER_JS_HOME/lib/cucumber/runtime/ast_tree_walker.js:91:9)\n    at iterate ($CUCUMBER_JS_HOME/lib/cucumber/type/collection.js:14:11)",
                    "status": "failed"
                  },
                  "match": {
                    "location": "TODO"
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

      Scenario: I've declaired one step which passes
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
    Then it should output this json:
      """
      [
        {
          "id": "some-feature",
          "name": "some feature",
          "description": "",
          "line": 1,
          "keyword": "Feature",
          "uri":"$CUCUMBER_JS_HOME/tmp/cucumber-js-sandbox/features/a.feature",
          "elements": [
            {
              "name": "I've declaired one step which passes",
              "id": "some-feature;i've-declaired-one-step-which-passes",
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
                    "status": "passed"
                  },
                  "match": {
                    "location": "TODO"
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

      Scenario: I've declaired one step which is passing, one pending and one failing.
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
    Then it should output this json:
      """
      [
        {
            "id": "some-feature",
            "name": "some feature",
            "description": "",
            "line": 1,
            "keyword": "Feature",
            "uri": "$CUCUMBER_JS_HOME/tmp/cucumber-js-sandbox/features/a.feature",
            "elements": [
                {
                    "name": "I've declaired one step which is passing, one pending and one failing.",
                    "id": "some-feature;i've-declaired-one-step-which-is-passing,-one-pending-and-one-failing.",
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
                                "status": "passed"
                            },
                            "match": {
                                "location": "TODO"
                            }
                        },
                        {
                            "name": "This step is pending",
                            "line": 5,
                            "keyword": "And ",
                            "result": {
                                "error_message": "TODO",
                                "status": "pending"
                            },
                            "match": {
                                "location": "TODO"
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
                                "location": "TODO"
                            }
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

      Scenario: I've declaired one step which is passing, one pending and one failing.
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
    Then it should output this json:
      """
      [
        {
          "id": "some-feature",
          "name": "some feature",
          "description": "",
          "line": 1,
          "keyword": "Feature",
          "uri": "$CUCUMBER_JS_HOME/tmp/cucumber-js-sandbox/features/a.feature",
          "elements": [
            {
              "name": "I've declaired one step which is passing, one pending and one failing.",
              "id": "some-feature;i've-declaired-one-step-which-is-passing,-one-pending-and-one-failing.",
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
                    "error_message": "TODO",
                    "status": "pending"
                  },
                  "match": {
                    "location": "TODO"
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
                    "location": "TODO"
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
                    "location": "TODO"
                  }
                }
              ]
            }
          ]
        }
      ]
      """

Scenario: one feature, one passing scenario, one failing scenario
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
    Then it should output this json:
      """
      [
        {
          "id": "one-passes one fails",
          "name": "one passes one fails",
          "description": "",
          "line": 1,
          "keyword": "Feature",
          "uri": "$CUCUMBER_JS_HOME/tmp/cucumber-js-sandbox/features/a.feature",
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
                    "status": "passed"
                  },
                  "match": {
                    "location": "TODO"
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
                    "error_message": "Error: Step failure\n    at Function.fail ($CUCUMBER_JS_HOME/lib/cucumber/support_code/step_definition.js:41:49)\n    at World.<anonymous> ($CUCUMBER_JS_HOME/tmp/cucumber-js-sandbox/features/step_definitions/cucumber_steps.js:3:70)\n    at Object.invoke ($CUCUMBER_JS_HOME/lib/cucumber/support_code/step_definition.js:52:14)\n    at Object.execute ($CUCUMBER_JS_HOME/lib/cucumber/ast/step.js:157:22)\n    at Object.acceptVisitor ($CUCUMBER_JS_HOME/lib/cucumber/ast/step.js:149:12)\n    at Object.executeStep ($CUCUMBER_JS_HOME/lib/cucumber/runtime/ast_tree_walker.js:170:12)\n    at Object.processStep ($CUCUMBER_JS_HOME/lib/cucumber/runtime/ast_tree_walker.js:165:14)\n    at $CUCUMBER_JS_HOME/lib/cucumber/runtime/ast_tree_walker.js:67:16\n    at callUserFunctionAndBroadcastAfterEvent ($CUCUMBER_JS_HOME/lib/cucumber/runtime/ast_tree_walker.js:91:9)\n    at iterate ($CUCUMBER_JS_HOME/lib/cucumber/type/collection.js:14:11)",
                    "status": "failed"
                  },
                  "match": {
                    "location": "TODO"
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
    When I run `cucumber.js -f json`
    Then it should output this json:
      """
      [
        {
          "id": "feature-a",
          "name": "feature a",
          "description": "",
          "line": 1,
          "keyword": "Feature",
          "uri": "$CUCUMBER_JS_HOME/tmp/cucumber-js-sandbox/features/a.feature",
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
                    "status": "passed"
                  },
                  "match": {
                    "location": "TODO"
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
          "uri": "$CUCUMBER_JS_HOME/tmp/cucumber-js-sandbox/features/b.feature",
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
                    "status": "passed"
                  },
                  "match": {
                    "location": "TODO"
                  }
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
          "uri": "$CUCUMBER_JS_HOME/tmp/cucumber-js-sandbox/features/c.feature",
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
                    "status": "passed"
                  },
                  "match": {
                    "location": "TODO"
                  }
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
    When I run `cucumber.js -f json`
    Then it should output this json:
      """
      [
        {
          "id": "feature-a",
          "name": "feature a",
          "description": "",
          "line": 1,
          "keyword": "Feature",
          "uri": "$CUCUMBER_JS_HOME/tmp/cucumber-js-sandbox/features/a.feature",
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
                    "status": "passed"
                  },
                  "match": {
                    "location": "TODO"
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
                    "status": "passed"
                  },
                  "match": {
                    "location": "TODO"
                  }
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
                    "status": "passed"
                  },
                  "match": {
                    "location": "TODO"
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
          "uri": "$CUCUMBER_JS_HOME/tmp/cucumber-js-sandbox/features/b.feature",
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
                    "status": "passed"
                  },
                  "match": {
                    "location": "TODO"
                  }
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
                    "status": "passed"
                  },
                  "match": {
                    "location": "TODO"
                  }
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
                    "status": "passed"
                  },
                  "match": {
                    "location": "TODO"
                  }
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
          "uri": "$CUCUMBER_JS_HOME/tmp/cucumber-js-sandbox/features/c.feature",
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
                    "status": "passed"
                  },
                  "match": {
                    "location": "TODO"
                  }
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
                    "status": "passed"
                  },
                  "match": {
                    "location": "TODO"
                  }
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
                    "status": "passed"
                  },
                  "match": {
                    "location": "TODO"
                  }
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
    Then it should output this json:
      """
      [
          {
              "id": "some-feature",
              "name": "some feature",
              "description": "",
              "line": 1,
              "keyword": "Feature",
              "uri": "$CUCUMBER_JS_HOME/tmp/cucumber-js-sandbox/features/a.feature",
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
  # Since the background step is re-evaluated for each scenario that is where the result of the step is currently recorded in the JSON output
  # If the background is being reevaluated  for each scenario then it would be misleading to only output the result for the first time it was evaluated.
 
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
    Then it should output this json:
      """
      [
          {
              "id": "some-feature",
              "name": "some feature",
              "description": "",
              "line": 1,
              "keyword": "Feature",
              "uri": "$CUCUMBER_JS_HOME/tmp/cucumber-js-sandbox/features/a.feature",
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
    Then it should output this json:
    # DocString doesn't appear to be being populated. QUESTION: Is this expected behaviour?
      """
      [
        {
          "id": "some-feature",
          "name": "some feature",
          "description": "",
          "line": 1,
          "keyword": "Feature",
          "uri": "$CUCUMBER_JS_HOME/tmp/cucumber-js-sandbox/features/a.feature",
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
                  "doc_string": {},
                  "result": {
                    "status": "passed"
                  },
                  "match": {
                    "location": "TODO"
                  }
                }
              ]
            }
          ]
        }
      ]
      """
   # TODO: Embedings
   # TODO: Tags
