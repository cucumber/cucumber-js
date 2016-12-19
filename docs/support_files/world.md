# World

*World* is an isolated context for each scenario, exposed to the hooks and steps as `this`.
The default world constructor is:
```js
function World({attach, parameters}) {
  attach = attach
  parameters = parameters
}
```

The default can be overridden with `setWorldConstructor`.
```javascript
var {defineSupportCode} = require('cucumber');
var seleniumWebdriver = require('selenium-webdriver');

function CustomWorld() {
  this.driver = new seleniumWebdriver.Builder()
    .forBrowser('firefox')
    .build();

  // Returns a promise that resolves to the element
  this.waitForElement = function(locator) {
    var condition = seleniumWebdriver.until.elementLocated(locator);
    return this.driver.wait(condition)
  }
}

defineSupportCode(function({setWorldConstructor}) {
  setWorldConstructor(CustomWorld)
});
```

**Note:** The World constructor was made strictly synchronous in *[v0.8.0](https://github.com/cucumber/cucumber-js/releases/tag/v0.8.0)*.
