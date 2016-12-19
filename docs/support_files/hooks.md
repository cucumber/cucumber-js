# Hooks

Hooks are used for setup and teardown the environment before and after each scenario. The first argument will be a [ScenarioResult](/src/models/scenario_result.js) for the current running scenario. Multiple *Before* hooks are executed in the order that they were defined. Multiple *After* hooks are executed in the **reverse** order that they were defined.

```javascript
var {defineSupportCode} = require('cucumber');

defineSupportCode(function({After, Before}) {
  // Synchronous
  Before(function () {
    this.count = 0;
  });

  // Asynchronous Callback
  Before(function (scenarioResult, callback) {
    var world = this;
    tmp.dir({unsafeCleanup: true}, function(error, dir) {
      if (error) {
        callback(error);
      } else {
        world.tmpDir = dir;
        callback();
      }
    });
  });

  // Asynchronous Promise
  After(function () {
    // Assuming this.driver is a selenium webdriver
    return this.driver.quit();
  });
});
```

## Tagged hooks

Hooks can be conditionally selected for execution based on the tags of the scenario.

``` javascript
var {defineSupportCode} = require('cucumber');

defineSupportCode(function({After, Before}) {
  Before(function () {
    // This hook will be executed before all scenarios
  });

  Before({tags: "@foo"}, function () {
    // This hook will be executed before scenarios tagged with @foo
  });

  Before({tags: "@foo and @bar"}, function () {
    // This hook will be executed before scenarios tagged with @foo and @bar
  });

  Before({tags: "@foo or @bar"}, function () {
    // This hook will be executed before scenarios tagged with @foo or @bar
  });

  // You can use the following shorthand when only specifying tags
  Before("@foo", function () {
    // This hook will be executed before scenarios tagged with @foo
  });
});
```

See more documentation on [tag expressions](https://docs.cucumber.io/tag-expressions/)
