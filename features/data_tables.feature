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
      assert = require('assert');

      stepDefinitions = function() {
        this.Given(/^a table step$/, function(table){
          expected = [
            ['Cucumber', 'Cucumis sativus'],
            ['Burr Gherkin', 'Cucumis anguria']
          ];
          assert.deepEqual(table.raw(), expected)
        });
      };

      module.exports = stepDefinitions
      """
    When I run cucumber.js with `--strict`
    Then it passes

  Scenario: rows
    Given a file named "features/passing_steps.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given a table step
            | Vegetable | Rating |
            | Apricot   | 5      |
            | Brocolli  | 2      |
            | Cucumber  | 10     |
      """
    Given a file named "features/step_definitions/passing_steps.js" with:
      """
      assert = require('assert');

      stepDefinitions = function() {
        this.Given(/^a table step$/, function(table){
          expected = [
            ['Apricot', '5'],
            ['Brocolli', '2'],
            ['Cucumber', '10']
          ];
          assert.deepEqual(table.rows(), expected)
        });
      };

      module.exports = stepDefinitions
      """
    When I run cucumber.js with `--strict`
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
      assert = require('assert');

      stepDefinitions = function() {
        this.Given(/^a table step$/, function(table){
          expected = {
            'Cucumber': 'Cucumis sativus',
            'Burr Gherkin': 'Cucumis anguria'
          };
          assert.deepEqual(table.rowsHash(), expected)
        });
      };

      module.exports = stepDefinitions
      """
    When I run cucumber.js with `--strict`
    Then it passes

  Scenario: hashes
    Given a file named "features/passing_steps.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given a table step
            | Vegetable | Rating |
            | Apricot   | 5      |
            | Brocolli  | 2      |
            | Cucumber  | 10     |
      """
    Given a file named "features/step_definitions/passing_steps.js" with:
      """
      assert = require('assert');

      stepDefinitions = function() {
        this.Given(/^a table step$/, function(table){
          expected = [
            {'Vegetable': 'Apricot', 'Rating': '5'},
            {'Vegetable': 'Brocolli', 'Rating': '2'},
            {'Vegetable': 'Cucumber', 'Rating': '10'}
          ];
          assert.deepEqual(table.hashes(), expected)
        });
      };

      module.exports = stepDefinitions
      """
    When I run cucumber.js with `--strict`
    Then it passes
