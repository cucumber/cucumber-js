Feature: Data Tables

  Scenario: raw
    Given a file named "features/passing_steps.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given a table step
            | Cucumber     | Cucumis sativus |
            | Burr Gherkin | Cucumis anguria |
      """
    Given a file named "features/step_definitions/passing_steps.js" with:
      """
      const {Given} = require('@cucumber/cucumber')
      const assert = require('assert')

      Given(/^a table step$/, function(table) {
        const expected = [
          ['Cucumber', 'Cucumis sativus'],
          ['Burr Gherkin', 'Cucumis anguria']
        ]
        assert.deepEqual(table.raw(), expected)
      })
      """
    When I run cucumber-js
    Then it passes

  Scenario: rows
    Given a file named "features/passing_steps.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given a table step
            | Vegetable | Rating |
            | Apricot   | 5      |
            | Broccoli  | 2      |
            | Cucumber  | 10     |
      """
    Given a file named "features/step_definitions/passing_steps.js" with:
      """
      const {Given} = require('@cucumber/cucumber')
      const assert = require('assert')

      Given(/^a table step$/, function(table) {
        const expected = [
          ['Apricot', '5'],
          ['Broccoli', '2'],
          ['Cucumber', '10']
        ]
        assert.deepEqual(table.rows(), expected)
      })
      """
    When I run cucumber-js
    Then it passes

  Scenario: rowsHash
    Given a file named "features/passing_steps.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given a table step
            | Cucumber     | Cucumis sativus |
            | Burr Gherkin | Cucumis anguria |
      """
    Given a file named "features/step_definitions/passing_steps.js" with:
      """
      const {Given} = require('@cucumber/cucumber')
      const assert = require('assert')

      Given(/^a table step$/, function(table) {
        const expected = {
          'Cucumber': 'Cucumis sativus',
          'Burr Gherkin': 'Cucumis anguria'
        }
        assert.deepEqual(table.rowsHash(), expected)
      })
      """
    When I run cucumber-js
    Then it passes

  Scenario: hashes
    Given a file named "features/passing_steps.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given a table step
            | Vegetable | Rating |
            | Apricot   | 5      |
            | Broccoli  | 2      |
            | Cucumber  | 10     |
      """
    Given a file named "features/step_definitions/passing_steps.js" with:
      """
      const {Given} = require('@cucumber/cucumber')
      const assert = require('assert')

      Given(/^a table step$/, function(table) {
        const expected = [
          {'Vegetable': 'Apricot', 'Rating': '5'},
          {'Vegetable': 'Broccoli', 'Rating': '2'},
          {'Vegetable': 'Cucumber', 'Rating': '10'}
        ]
        assert.deepEqual(table.hashes(), expected)
      })
      """
    When I run cucumber-js
    Then it passes
