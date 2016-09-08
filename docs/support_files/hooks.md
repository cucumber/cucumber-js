# Hooks

Hooks are used for setup and teardown the environment before and after each scenario.
The first argument will be the current running scenario.
See [Cucumber.Api.Scenario](https://github.com/cucumber/cucumber-js/blob/master/lib/cucumber/api/scenario.js) for more information.
Multiple *Before* hooks are executed in the order that they were defined.
Multiple *After* hooks are executed in the **reverse** order that they were defined.

```javascript
var myHooks = function () {
  // Synchronous
  this.Before(function (scenario) {
    this.count = 0;
  });

  // Asynchronous Callback
  this.Before(function (scenario, callback) {
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
  this.After(function (scenario) {
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
  this.Before(function (scenario) {
    // This hook will be executed before all scenarios
  });

  this.Before({tags: ["@foo"]}, function (scenario) {
    // This hook will be executed before scenarios tagged with @foo
  });

  this.Before({tags: ["@foo", "@bar"]}, function (scenario) {
    // This hook will be executed before scenarios tagged with @foo AND @bar
  });

  this.Before({tags: ["@foo,@bar", "bar"]}, function (scenario) {
    // This hook will be executed before scenarios tagged with @foo OR @bar
  });

  // You can use the following shorthand when specifying a single tag
  this.Before("@foo", function (scenario) {
    // This hook will be executed before scenarios tagged with @foo
    // ...
  });
};

module.exports = myHooks;
```
