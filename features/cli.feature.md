# Command line interface
In order to run cucumber in different contexts
As a person who wants to run features
I want to run Cucumber on the command line

## Scenario: run feature with non-default step definitions file location specified (-r option)

* Given a file named "features/a.feature" with:
  ```gherkin
  Feature: some feature
    Scenario:
      When a step is passing
  ```
* And a file named "step_definitions/cucumber_steps.js" with:
  ```javascript
  const {When} = require('@cucumber/cucumber')

  When(/^a step is passing$/, function() {})
  ```
* When I run cucumber-js with `-r step_definitions/cucumber_steps.js`
* Then it passes

## Scenario: run Markdown feature with non-default step definitions file location specified (-r option)

* Given a file named "features/a.feature.md" with:
  ```markdown
  # Feature: some feature
  ## Scenario:
  * When a step is passing
  ```
* And a file named "step_definitions/cucumber_steps.js" with:
  ```javascript
  const {When} = require('@cucumber/cucumber')

  When(/^a step is passing$/, function() {})
  ```
* When I run cucumber-js with `-r step_definitions/cucumber_steps.js`
* Then it passes

## Scenario: run feature with step definitions in required directory (-r option)

* Given a file named "features/a.feature" with:
  ```gherkin
  Feature: some feature
    Scenario:
      When a step is passing
  ```
* And a file named "step_definitions/cucumber_steps.js" with:
  ```javascript
  const {When} = require('@cucumber/cucumber')

  When(/^a step is passing$/, function() {});
  ```
* When I run cucumber-js with `-r step_definitions`
* Then it passes

`@spawn`
# Scenario: display Cucumber version

* When I run cucumber-js with `--version`
* Then I see the version of Cucumber

`@spawn`
# Scenario: display help
* When I run cucumber-js with `--help`
* Then I see the help text for Cucumber
