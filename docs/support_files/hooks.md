# Hooks

Hooks are used for setup and teardown the environment before and after each scenario. See the [API reference](./api_reference.md) for the specification of the first argument passed to hooks. Multiple *Before* hooks are executed in the order that they were defined. Multiple *After* hooks are executed in the **reverse** order that they were defined.

Note that your hook functions cannot reference the [world](./world.md) as `this` if you use
arrow functions. See [FAQ](../faq.md) for details.

```javascript
const {After, Before} = require('@cucumber/cucumber');

// Synchronous
Before(function () {
  this.count = 0;
});

// Asynchronous Callback
Before(function (testCase, callback) {
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
```

## Named hooks

ℹ️ Added in v8.1.0

Hooks can optionally be named:

```javascript
const {Before} = require('@cucumber/cucumber');

Before({name: "Set up some test state"}, function () {
// do stuff here
});
```

Such hooks will then be referenced by name in [formatter](../formatters.md) output, which can be useful to help you understand what's happening with your tests.

## Tagged hooks

Hooks can be conditionally selected for execution based on the tags of the scenario.

```javascript
const {After, Before} = require('@cucumber/cucumber');

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
```

See more documentation on [tag expressions](https://docs.cucumber.io/cucumber/api/#tag-expressions)

## Skipping in a Before Hook

If you need to imperatively skip a test using a `Before` hook, this can be done using any of the constructs defined in [skipped steps](./step_definitions.md)

This includes using: a synchronous return, an asynchronous callback, or an asynchronous promise

```javascript
// Synchronous
Before(function() {
  // perform some runtime check to decide whether to skip the proceeding scenario
  return 'skipped'
});
```

## BeforeAll / AfterAll

If you have some setup / teardown that needs to be done before or after all scenarios, use `BeforeAll` / `AfterAll`. Like hooks and steps, these can be synchronous, accept a callback, or return a promise.

```javascript
const {AfterAll, BeforeAll} = require('@cucumber/cucumber');

// Synchronous
BeforeAll(function () {
  // perform some shared setup
});

// Asynchronous Callback
BeforeAll(function (callback) {
  // perform some shared setup

  // execute the callback (optionally passing an error when done)
});

// Asynchronous Promise
AfterAll(function () {
  // perform some shared teardown
  return Promise.resolve()
});
```

### World parameters in BeforeAll/AfterAll

ℹ️ Added in v10.1.0

`BeforeAll`/`AfterAll` hooks aren't given a World instance bound to `this` like other hooks and steps. But they can access [World parameters](./world.md#world-parameters) via `this.parameters` in order to:

- Use the parameters as configuration to drive automation
- Update the parameters with extra context which will then be available to other hooks and steps

Here's a fictional example of obtaining an auth token that can then be used by all tests:

```javascript
const {AfterAll, BeforeAll} = require('@cucumber/cucumber');

BeforeAll(async function () {
  this.parameters.accessToken = await getAccessToken(this.parameters.oauth) 
});
```

## BeforeStep / AfterStep

If you have some code execution that needs to be done before or after all steps, use `BeforeStep` / `AfterStep`. Like the `Before` / `After` hooks, these also have a world instance as 'this', and can be conditionally selected for execution based on the tags of the scenario.

```javascript
const {AfterStep, BeforeStep} = require('@cucumber/cucumber');

BeforeStep({tags: "@foo"}, function () {
  // This hook will be executed before all steps in a scenario with tag @foo
});

AfterStep( function ({result}) {
  // This hook will be executed after all steps, and take a screenshot on step failure
  if (result.status === Status.FAILED) {
    this.driver.takeScreenshot();
  }
});
```
