## Setup

* Install [Node.js](https://nodejs.org) (6 or higher)
* Install the following node modules with [yarn](https://yarnpkg.com/en/) or [npm](https://www.npmjs.com/)
  * chai@latest
  * cucumber@latest

* Add the following files

    ```gherkin
    # features/simple_math.feature
    Feature: Simple maths
      In order to do maths
      As a developer
      I want to increment variables

      Scenario: easy maths
        Given a variable set to 1
        When I increment the variable by 1
        Then the variable should contain 2

      Scenario Outline: much more complex stuff
        Given a variable set to <var>
        When I increment the variable by <increment>
        Then the variable should contain <result>

        Examples:
          | var | increment | result |
          | 100 |         5 |    105 |
          |  99 |      1234 |   1333 |
          |  12 |         5 |     17 |
    ```

    ```javascript
    // features/support/world.js
    const { setWorldConstructor } = require('cucumber')

    class CustomWorld {
      constructor() {
        this.variable = 0
      }

      setTo(number) {
        this.variable = number
      }

      incrementBy(number) {
        this.variable += number
      }
    }

    setWorldConstructor(CustomWorld)
    ```

    ```javascript
    // features/support/steps.js
    const { Given, When, Then } = require('cucumber')
    const { expect } = require('chai')

    Given('a variable set to {int}', function(number) {
      this.setTo(number)
    })

    When('I increment the variable by {int}', function(number) {
      this.incrementBy(number)
    })

    Then('the variable should contain {int}', function(number) {
      expect(this.variable).to.eql(number)
    })
    ```

* Run `./node_modules/.bin/cucumber-js`
