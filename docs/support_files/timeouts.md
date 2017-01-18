# Timeouts

By default, asynchronous hooks and steps timeout after 5000 milliseconds.
This can be modified globally with:

```javascript
var {defineSupportCode} = require('cucumber');

defineSupportCode(function({setDefaultTimeout}) {
  setDefaultTimeout(60 * 1000);
});
```

A specific hook's or step's timeout can be set with:

```javascript
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

## Disable Timeouts

**DO NOT USE THIS UNLESS ABSOLUTELY NECESSARY**

Disable timeouts by setting it to -1.
If you use this, you need to implement your own timeout protection.
Otherwise the test suite may end prematurely or hang indefinitely.

```javascript
var {defineSupportCode} = require('cucumber');
var Promise = require('bluebird');

defineSupportCode(function({Before, Given}) {
  Given('the operation completes within {n} minutes', {timeout: -1}, function(minutes) {
    const milliseconds = (minutes + 1) * 60 * 1000
    const message = `operation did not complete within ${minutes} minutes`
    return Promise(this.verifyOperationComplete()).timeout(milliseconds, message);
  });
});
```
