Feature: Handling step errors
  We should be able to correctly handle arbitrary error objects from steps
  This includes objects that are not Errors or not json-serializable

  Scenario: Complex error object passed to callback
    Given a file named "features/a.feature" with:
      """
      Feature: a
        Scenario: b
          Given I pass an error to the callback
      """
    Given a file named "features/step_definitions/step_definitions.js" with:
      """
      const {Given} = require('@cucumber/cucumber')

      Given('I pass an error to the callback', function (cb) {
        var unusualErrorObject = {}
        unusualErrorObject.member = unusualErrorObject
        cb(unusualErrorObject)
      })
      """
    When I run cucumber-js
    Then scenario "b" step "Given I pass an error to the callback" failed with:
      """
      { member: [Circular] }
      """
    And it fails
