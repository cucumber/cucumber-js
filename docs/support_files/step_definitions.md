# Step Definitions

Step definitions are glue between features written in Gherkin and the actual system under test.
Use `this.Given`, `this.When`, `this.Then`, and `this.defineStep`.
Matching groups in the regular expression are passed as parameters to the step definition.

```javascript
var fs = require('fs');
var mzFs = require('mz/fs')
var seleniumWebdriver = require('selenium-webdriver');

module.exports = function () {
  // Synchronous
  this.Then(/^Then the response status is (.*)$/, function (status) {
    assert.equal(this.responseStatus, status)
  });

  // Asynchronous - callback
  this.Then(/^Then the file named (.*) is empty$/, function (fileName, callback) {
    fs.readFile(fileName, 'utf8', function(error, contents) {
      if (error) {
        callback(error);
      } else {
        assert.equal(contents, '');
        callback();
      }
    });
  });

  // Asynchronous - generator
  this.Then(/^Then the file named (.*) is empty$/, function *(fileName) {
    contents = yield fs.readFile(fileName, 'utf8');
    assert.equal(contents, '');
  });

  // Asynchronous - promise
  this.When(/^I view my profile$/, function () {
    // Assuming this.driver is a selenium webdriver
    return this.driver.findElement({css: '.profile-link'}).then(function(element) {
      return element.click();
    });
  });
};
```

When the step definition function is a generator, it is run with [co](https://github.com/tj/co).

## Pending steps

Each interface has its own way of marking a step as pending
* synchronous / asynchronous generator - return `'pending'`
* asynchronous callback - execute the callback with `null, 'pending'`
* asynchronous promise - promise resolves to `'pending'`
