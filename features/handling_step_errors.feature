Feature: Handling step errors
  We should be able to correctly handle arbitrary error objects from steps
  This includes objects that are not Errors or not json-serializable

  Scenario: Complex error object passed to callback
    Given a file named "features/step_definitions/step_definitions.js" with:
      """
      module.exports = function () {
        this.Given('I pass an error to the callback', function (cb) {
          var unusualErrorObject = {};
          unusualErrorObject.member = unusualErrorObject;
          cb(unusualErrorObject);
        });
      };
      """
    Given a file named "features/a.feature" with:
      """
      Feature:
        Scenario:
          Given I pass an error to the callback
      """
    When I run cucumber.js with `-f json:json`
    Then the file "json" contains the text:
      """
      { member: [Circular] }
      """
    And the exit status should be 1
