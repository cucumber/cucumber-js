# Step Definitions

Step definitions (`Given`, `When`, `Then`) are the glue between features written in Gherkin and the actual tests implementation.

Cucumber supports two types of expressions:

- **Cucumber expressions**
- **Regular expressions**

## Cucumber expressions

[Full docs.](https://cucumber.io/docs/cucumber/cucumber-expressions/)

Gherkin:
```gherkin
Given I have 42 cucumbers in my belly
```

JS:
```js
import { Given } from '@cucumber/cucumber';

Given('I have {int} cucumbers in my belly', function (cucumberCount) {
  assert.equal(this.responseStatus, cucumberCount)
});
```

Note that your step definition functions cannot reference the [world](./world.md) as `this` if you use
arrow functions. See [FAQ](../faq.md) for details.

## Regular expressions

Matching groups in the regular expression are passed as parameters to the step definition.

```javascript
const { Then, When } = require('@cucumber/cucumber');
const assert = require('assert');
const fs = require('fs');
const mzFs = require('mz/fs')
const seleniumWebdriver = require('selenium-webdriver');

// Synchronous
Then(/^the response status is (.*)$/, function (status) {
  assert.equal(this.responseStatus, status)
});

// Asynchronous - callback
//
// Take a callback as an additional argument to execute when the step is done
Then(/^the file named (.*) is empty$/, function (fileName, callback) {
  fs.readFile(fileName, 'utf8', function(error, contents) {
    if (error) {
      callback(error);
    } else {
      assert.equal(contents, '');
      callback();
    }
  });
});

// Asynchronous - promise
//
// Return a promise. The step is done when the promise resolves or rejects
When(/^I view my profile$/, function () {
  // Assuming this.driver is a selenium webdriver
  return this.driver.findElement({ css: '.profile-link' }).then(function(element) {
    return element.click();
  });
});
```

## Pending steps

Each interface has its own way of marking a step as pending
* synchronous - return `'pending'`
* asynchronous callback - execute the callback with `null, 'pending'`
* asynchronous promise - promise resolves to `'pending'`

## Skipped steps

Marking a step as skipped will also mark the proceeding steps of the same scenario as skipped.

This can be used to mark a scenario as skipped based on a runtime condition.

Each interface has its own way of marking a step as skipped
* synchronous - return `'skipped'`
* asynchronous callback - execute the callback with `null, 'skipped'`
* asynchronous promise - promise resolves to `'skipped'`
