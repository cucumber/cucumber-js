# Timeouts

By default, asynchronous hooks and steps timeout after 5000 milliseconds.
This can be modified globally with:

```javascript
var {setDefaultTimeout} = require('cucumber');

setDefaultTimeout(60 * 1000);
```

A specific hook's or step's timeout can be set with:

```javascript
var {Before, Given} = require('cucumber');

Before({timeout: 60 * 1000}, function() {
  // Does some slow browser/filesystem/network actions
});

Given(/^a slow step$/, {timeout: 60 * 1000}, function() {
  // Does some slow browser/filesystem/network actions
});
```

## Disable Timeouts

**DO NOT USE THIS UNLESS ABSOLUTELY NECESSARY**

Disable timeouts by setting it to -1.
If you use this, you need to implement your own timeout protection.
Otherwise the test suite may end prematurely or hang indefinitely.

```javascript
var {Given, When} = require('cucumber');

When('the operation completes within {n} minutes', {timeout: -1}, async( minutes ) {
  const custom_wait_time = minutes * 60 * 1000;
  const promise = new Promise(function( resolve, reject ) {
    // Set up the timeout and get its id
    const custom_timeout = setTimeout(function() {
      reject(`Operation did not complete within ${ minutes } ms`);
    }, custom_wait_time);
    // Do your stuff inside a self-invoking anonymous async function
    (async function() {
      try {
        const result = await myAsyncStuff();
        resolve( result );
      } catch (err) {
        reject( err );
      } finally {
        // prevent remaining timeout hang that could otherwise happen at end of tests
        clearTimeout( custom_timeout );
      }
    })();
  });
  
  const the_good_stuff = await promise;
  
  // Do other stuff as long as it will also definitely finish
  console.log(`Everything from here on out has to finish as well.`);
});
```
