# Timeouts

By default, asynchronous hooks and steps timeout after 5000 milliseconds.
This can be modified globally with:

```js
var configure = function () {
  this.setDefaultTimeout(60 * 1000);
};

module.exports = configure;
```

A specific hook's or step's timeout can be set with:

```js
// features/step_definitions/my_steps.js

module.exports = function () {
  this.Before({timeout: 60 * 1000}, function(scenario, callback) {
    // Does some slow browser/filesystem/network actions
  });

  this.Given(/^a slow step$/, {timeout: 60 * 1000}, function(callback) {
    // Does some slow browser/filesystem/network actions
  });
};
```
