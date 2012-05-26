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