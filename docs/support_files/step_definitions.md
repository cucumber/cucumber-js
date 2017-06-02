# Step Definitions

Step definitions are glue between features written in Gherkin and the actual system under test.
Use `this.Given`, `this.When`, `this.Then`, and `this.defineStep`.
Matching groups in the regular expression are passed as parameters to the step definition.

```javascript
var {defineSupportCode} = require('cucumber');
var fs = require('fs');
var mzFs = require('mz/fs')
var seleniumWebdriver = require('selenium-webdriver');


defineSupportCode(function({Then, When}) {
  // Synchronous
  Then(/^Then the response status is (.*)$/, function (status) {
    assert.equal(this.responseStatus, status)
  });

  // Asynchronous - callback
  //
  // Take a callback as an additional argument to execute when the step is done
  Then(/^Then the file named (.*) is empty$/, function (fileName, callback) {
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
    var element = this.driver.findElement({css: '.profile-link'});
    return element.click();
  });
});
```


## Definition function wrapper

If you would like to wrap step or hook definitions in with some additional logic you can use `this.setDefinitionFunctionWrapper(fn)`. The definitions will be wrapped after they have all been loaded but before the tests begin to run. One example usage is wrapping generator functions to return promises. Cucumber will do an additional stage of wrapping to ensure the function retains its original length.

```javascript
// features/step_definitions/file_steps.js
var {defineSupportCode} = require('cucumber');
var mzFs = require('mz/fs');

defineSupportCode(function({Then, When}) {
  this.Then(/^Then the file named (.*) is empty$/, function *(fileName) {
    contents = yield mzFs.readFile(fileName, 'utf8');
    assert.equal(contents, '');
  });
});


// features/support/setup.js
var {defineSupportCode} = require('cucumber');
var isGenerator = require('is-generator');
var Promise = require('bluebird');

defineSupportCode(function({setDefinitionFunctionWrapper}) {
  setDefinitionFunctionWrapper(function (fn) {
    if (isGenerator.fn(fn)) {
      return Promise.coroutine(fn);
    } else {
      return fn;
    }
  });
});
```

## Pending steps

Each interface has its own way of marking a step as pending
* synchronous - return `'pending'`
* asynchronous callback - execute the callback with `null, 'pending'`
* asynchronous promise - promise resolves to `'pending'`
