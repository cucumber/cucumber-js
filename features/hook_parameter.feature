Feature: Hook Parameters

  @spawn
  Scenario: before hook parameter
    Given a file named "features/my_feature.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given a step
      """
    And a file named "features/step_definitions/my_steps.js" with:
      """
      const {When} = require('@cucumber/cucumber')

      When(/^a step$/, function() {})
      """
    And a file named "features/support/hooks.js" with:
      """
      const {Before, formatterHelpers} = require('@cucumber/cucumber')

      Before(function({pickle, gherkinDocument}) {
        const { line } = formatterHelpers.PickleParser.getPickleLocation({ gherkinDocument, pickle })
        console.log(pickle.uri + ":" + line)
        console.log('tags: ', pickle.tags.map(t => t.name));
        console.log('name: ', pickle.name);
      })
      """
    When I run cucumber-js
    Then the output contains the text:
      """
      features/my_feature.feature:2
      tags: []
      name: a scenario
      """

  @spawn
  Scenario: after hook parameter
    Given a file named "features/my_feature.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given a passing step

        Scenario: another scenario
          Given a failing step
      """
    And a file named "features/step_definitions/my_steps.js" with:
      """
      const {When} = require('@cucumber/cucumber')

      When(/^a passing step$/, function() {})
      When(/^a failing step$/, function() { throw new Error("my error") })
      """
    And a file named "features/support/hooks.js" with:
      """
      const { After, formatterHelpers, Status } = require('@cucumber/cucumber')

      After(function({pickle, gherkinDocument, result}) {
        const { line } = formatterHelpers.PickleParser.getPickleLocation({ gherkinDocument, pickle })
        let message = pickle.uri + ":" + line + " "
        if (result.status === Status.FAILED) {
          message += "failed"
        } else {
          message += "did not fail"
        }
        console.log(message)
        console.log('tags: ', pickle.tags.map(t => t.name));
        console.log('name: ', pickle.name);
      })
      """
    When I run cucumber-js
    Then it fails
    And the output contains the text:
      """
      features/my_feature.feature:2 did not fail
      tags: []
      name: a scenario
      """
    And the output contains the text:
      """
      features/my_feature.feature:5 failed
      tags: []
      name: another scenario
      """
