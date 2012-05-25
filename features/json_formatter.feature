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
{
  "name": "some feature",
  "id": ""
}
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
{
  "name": "some feature",
  "id": "",
  "elements": [
    {
      "name": "I havn't done anything yet"
    }
  ]
}
      """
  Scenario: output JSON for a feature with one scenario with one pending step
    Given a file named "features/a.feature" with:
      """
      Feature: some feature

      Scenario: I've declaired one step but not yet defined it'
          Given I have not defined this step
      """
    When I run `cucumber.js -f json`
    Then it should pass with this json:
      """
    [{"elements":
    [
     {"id":"some-feature;i've-declaired-one-step-but-not-yet-defined-it'",
      "line":3,
      "keyword":"Scenario",
      "steps":[
               {"result":{"status":"undefined"},
                "line":4,"keyword":
                "Given ","match":{"location":"simple.feature:4"},
                "name":"I have not defined this step"}
              ],
      "description":"",
      "type":"scenario",
      "name":"I've declaired one step but not yet defined it'"
     }
    ],
    "id":"some-feature",
    "line":1,
    "uri":"simple.feature",
    "keyword":"Feature",
    "description":"",
    "name":"some feature"}]
      """  

