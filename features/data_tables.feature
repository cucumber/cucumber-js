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
      import {defineSupportCode} from 'cucumber'
      import assert from 'assert'

      defineSupportCode(({Given}) => {
        Given(/^a table step$/, function(table) {
          const expected = [
            ['Cucumber', 'Cucumis sativus'],
            ['Burr Gherkin', 'Cucumis anguria']
          ]
          assert.deepEqual(table.raw(), expected)
        })
      })
      """
    When I run cucumber.js
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
      import {defineSupportCode} from 'cucumber'
      import assert from 'assert'

      defineSupportCode(({Given}) => {
        Given(/^a table step$/, function(table) {
          const expected = [
            ['Apricot', '5'],
            ['Brocolli', '2'],
            ['Cucumber', '10']
          ]
          assert.deepEqual(table.rows(), expected)
        })
      })
      """
    When I run cucumber.js
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
      import {defineSupportCode} from 'cucumber'
      import assert from 'assert'

      defineSupportCode(({Given}) => {
        Given(/^a table step$/, function(table) {
          const expected = {
            'Cucumber': 'Cucumis sativus',
            'Burr Gherkin': 'Cucumis anguria'
          }
          assert.deepEqual(table.rowsHash(), expected)
        })
      })
      """
    When I run cucumber.js
    Then it passes

  Scenario: typedRowsHash
    Given a file named "features/passing_steps.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given a table step
            | Cucumber   | String | Cucumis sativus |
            | Stars      | Number | 5               |
            | OK         | Y/N    | Y               |
            | Typed Since| Date   | 2017-02-05      |
            | Best For   | list   | bdd,ci,cd       |
            | compound   | JSON   | {"name":"Joe"}  |
      """
    Given a file named "features/step_definitions/passing_steps.js" with:
      """
      import {defineSupportCode} from 'cucumber'
      import assert from 'assert'

      defineSupportCode(({Given}) => {
        Given(/^a table step$/, function(table) {
          const expected = {
            'Cucumber': 'Cucumis sativus',
            'Stars': 5,
            'OK: true,
            'Best For': ['bdd','ci','cd']
            'Typed Since': new Date('2017-02-05')
            'compound': {name:'joe'}
          }
          assert.deepEqual(table.rowsHash(), expected)
        })
      })
      """
    When I run cucumber.js
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
      import {defineSupportCode} from 'cucumber'
      import assert from 'assert'

      defineSupportCode(({Given}) => {
        Given(/^a table step$/, function(table) {
          const expected = [
            {'Vegetable': 'Apricot', 'Rating': '5'},
            {'Vegetable': 'Brocolli', 'Rating': '2'},
            {'Vegetable': 'Cucumber', 'Rating': '10'}
          ]
          assert.deepEqual(table.hashes(), expected)
        })
      })
      """
    When I run cucumber.js
    Then it passes
