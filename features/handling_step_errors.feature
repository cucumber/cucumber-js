Feature: Handling step errors
  We should be able to correctly handle arbitrary error objects from steps
  This includes objects that are not Errors or not json-serializable
  It should work for every step error mechanism (synchronous exception,
  callback, promise), and for all formatter types.

  Background:
    Given a file named "features/step_definitions/step_definitions.js" with:
      """
      var unusualErrorObject = {};
      unusualErrorObject.member = unusualErrorObject;
      module.exports = function () {
        this.Given('I raise an exception', function () {
          throw unusualErrorObject;
        });
        this.Given('I pass an error to the callback', function (cb) {
          cb(unusualErrorObject);
        });
        this.Given('I reject a promise', function () {
          // For compatibility with node 0.10 and to avoid adding a
          // dependency, we use the fact that Cucumber.js considers
          // anything with a "then" member function to be a Promise
          return { then: function(onResolved, onRejected) {
            onRejected(unusualErrorObject);
          }};
        });
      };
      """

  Scenario: synchronous error
    Given a file named "features/a.feature" with:
      """
      Feature:
        Scenario:
          Given I raise an exception
      """
    When I run cucumber.js with `-f json:json -f pretty:pretty -f progress:progress -f rerun:rerun -f summary:summary`
    Then the file "json" contains the text:
      """
      { member: [Circular] }
      """
    And the file "pretty" contains the text:
      """
      { member: [Circular] }
      """
    And the file "progress" contains the text:
      """
      { member: [Circular] }
      """
    And the file "rerun" contains the text:
      """
      features/a.feature:2
      """
    And the file "summary" contains the text:
      """
      { member: [Circular] }
      """
    And the exit status should be 1

  Scenario: callback error
    Given a file named "features/a.feature" with:
      """
      Feature:
        Scenario:
          Given I pass an error to the callback
      """
    When I run cucumber.js with `-f json:json -f pretty:pretty -f progress:progress -f rerun:rerun -f summary:summary`
    Then the file "json" contains the text:
      """
      { member: [Circular] }
      """
    And the file "pretty" contains the text:
      """
      { member: [Circular] }
      """
    And the file "progress" contains the text:
      """
      { member: [Circular] }
      """
    And the file "rerun" contains the text:
      """
      features/a.feature:2
      """
    And the file "summary" contains the text:
      """
      { member: [Circular] }
      """
    And the exit status should be 1

  Scenario: promise error
    Given a file named "features/a.feature" with:
      """
      Feature:
        Scenario:
          Given I reject a promise
      """
    When I run cucumber.js with `-f json:json -f pretty:pretty -f progress:progress -f rerun:rerun -f summary:summary`
    Then the file "json" contains the text:
      """
      { member: [Circular] }
      """
    And the file "pretty" contains the text:
      """
      { member: [Circular] }
      """
    And the file "progress" contains the text:
      """
      { member: [Circular] }
      """
    And the file "rerun" contains the text:
      """
      features/a.feature:2
      """
    And the file "summary" contains the text:
      """
      { member: [Circular] }
      """
    And the exit status should be 1
