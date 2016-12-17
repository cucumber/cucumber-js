# Timeouts

By default, asynchronous hooks and steps timeout after 5000 milliseconds.
This can be modified globally with:

```js
var {defineSupportCode} = require('cucumber');

defineSupportCode(function({setDefaultTimeout}) {
  setDefaultTimeout(60 * 1000);
});
```

A specific hook's or step's timeout can be set with:

```js
var {defineSupportCode} = require('cucumber');

defineSupportCode(function({Before, Given}) {
  Before({timeout: 60 * 1000}, function() {
    // Does some slow browser/filesystem/network actions
  });

  Given(/^a slow step$/, {timeout: 60 * 1000}, function() {
    // Does some slow browser/filesystem/network actions
  });
});
```
