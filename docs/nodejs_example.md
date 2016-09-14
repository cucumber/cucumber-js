## Setup

* Install [Chrome](https://www.google.com/chrome/)
* Run `npm install --save-dev cucumber selenium-webdriver chromedriver`
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
    var chrome = require('selenium-webdriver/chrome');
    var chromeDriverPath = require('chromedriver').path;
    chrome.setDefaultService(new chrome.ServiceBuilder(chromeDriverPath).build())

    function CustomWorld() {
      this.driver = new chrome.Driver()
    }

    module.exports = function() {
      this.World = CustomWorld;
    };
    ```

    ```javascript
    // features/step_definitions/hooks.js
    module.exports = function () {
      this.After(function() {
        return this.driver.quit();
      });
    };
    ```

    ```javascript
    // features/step_definitions/browser_steps.js
    var seleniumWebdriver = require('selenium-webdriver');

    module.exports = function () {
      this.Given(/^I am on the Cucumber.js GitHub repository$/, function() {
        return this.driver.get('https://github.com/cucumber/cucumber-js/tree/master');
      });

      this.When(/^I click on "([^"]*)"$/, function (text) {
        return this.driver.findElement({linkText: text}).then(function(element) {
          return element.click();
        });
      });

      this.Then(/^I should see "([^"]*)"$/, function (text) {
        var xpath = "//*[contains(text(),'" + text + "')]";
        var condition = seleniumWebdriver.until.elementLocated({xpath: xpath});
        return this.driver.wait(condition, 5000);
      });
    };
    ```

* Run `./node_modules/.bin/cucumber-js`
