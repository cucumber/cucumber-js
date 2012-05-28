# TODO: Reinstate "uri":"a.feature",

Feature: JSON Formatter
  In order to simplify processing of Cucumber features and results
  Developers should be able to consume features as JSON

  Scenario: output JSON for a feature with no scenarios
    Given a file named "features/a.feature" with:
      """
      Feature: some feature
      """
    When I run `cucumber.js -f json`
    Then it should pass with this json:
      """
[
  {"id":"some-feature",
   "name":"some feature",
   "description":"",
   "line":1,
   "keyword":"Feature"
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
    Then it should pass with this json:
      """
[
  {
   "id":"some-feature",
   "name":"some feature",
   "description":"",
   "line":1,
   "keyword":"Feature",
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
    Then it should pass with this json:
      """
[
  {
    "id": "some-feature",
    "name": "some feature",
    "description": "",
    "line": 1,
    "keyword": "Feature",
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

      Scenario: I've declaired one step but not yet defined it
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
    Then it should pass with this json:
      """
      [
          {
              "id": "some-feature",
              "name": "some feature",
              "description": "",
              "line": 1,
              "keyword": "Feature",
              "elements": [
                  {
                      "name": "I've declaired one step but not yet defined it",
                      "id": "some-feature;i've-declaired-one-step-but-not-yet-defined-it",
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
