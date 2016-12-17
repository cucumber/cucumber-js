## Setup

* Install [Chrome](https://www.google.com/chrome/)
* Instsll [nodejs](https://nodejs.org/en/) (6 or higher)
* Run `npm install --save-dev cucumber selenium-webdriver@3.0.1 chromedriver@2.25.1`
* Add the following files

    ```gherkin
    # features/documentation.feature
    Feature: Example feature
      As a user of Cucumber.js
      I want to have documentation on Cucumber
      So that I can concentrate on building awesome applications

      Scenario: Reading documentation
        Given I am on the Cucumber.js GitHub repository
        When I click on "CLI"
        Then I should see "Running specific features"
    ```

    ```javascript
    // features/support/world.js
    require('chromedriver')
    var seleniumWebdriver = require('selenium-webdriver');
    var {defineSupportCode} = require('cucumber');

    function CustomWorld() {
      this.driver = new seleniumWebdriver.Builder()
        .forBrowser('chrome')
        .build();
    }

    defineSupportCode(function({setWorldConstructor}) {
      setWorldConstructor(CustomWorld)
    })
    ```

    ```javascript
    // features/step_definitions/hooks.js
    var {defineSupportCode} = require('cucumber');

    defineSupportCode(function({After}) {
      After(function() {
        return this.driver.quit();
      });
    });
    ```

    ```javascript
    // features/step_definitions/browser_steps.js
    var seleniumWebdriver = require('selenium-webdriver');
    var {defineSupportCode} = require('cucumber');

    defineSupportCode(function({Given, When, Then}) {
      Given('I am on the Cucumber.js GitHub repository', function() {
        return this.driver.get('https://github.com/cucumber/cucumber-js/tree/master');
      });

      When('I click on {stringInDoubleQuotes}', function (text) {
        return this.driver.findElement({linkText: text}).then(function(element) {
          return element.click();
        });
      });

      Then('I should see {stringInDoubleQuotes}', function (text) {
        var xpath = "//*[contains(text(),'" + text + "')]";
        var condition = seleniumWebdriver.until.elementLocated({xpath: xpath});
        return this.driver.wait(condition, 5000);
      });
    });
    ```

* Run `./node_modules/.bin/cucumber-js`
