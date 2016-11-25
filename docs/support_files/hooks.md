# Hooks

Hooks are used for setup and teardown the environment before and after each scenario. The first argument will be a [ScenarioResult](/src/models/scenario_result.js) for the current running scenario. Multiple *Before* hooks are executed in the order that they were defined. Multiple *After* hooks are executed in the **reverse** order that they were defined.

```javascript
var myHooks = function () {
  // Synchronous
  this.Before(function () {
    this.count = 0;
  });

  // Asynchronous Callback
  this.Before(function (scenarioResult, callback) {
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
  this.After(function () {
    // Assuming this.driver is a selenium webdriver
    return this.driver.quit();
  });
};

module.exports = myHooks;
```

## Tagged hooks

Hooks can be conditionally selected for execution based on the tags of the scenario.

``` javascript
var myHooks = function () {
  this.Before(function () {
    // This hook will be executed before all scenarios
  });

  this.Before({tags: "@foo"}, function () {
    // This hook will be executed before scenarios tagged with @foo
  });

  this.Before({tags: "@foo and @bar"}, function () {
    // This hook will be executed before scenarios tagged with @foo and @bar
  });

  this.Before({tags: "@foo or @bar"}, function () {
    // This hook will be executed before scenarios tagged with @foo or @bar
  });

  // You can use the following shorthand when only specifying tags
  this.Before("@foo", function () {
    // This hook will be executed before scenarios tagged with @foo
  });
};

module.exports = myHooks;
```

See more documentation on [tag expressions](https://docs.cucumber.io/tag-expressions/)
