# World

*World* is an isolated context for each scenario, exposed to the hooks and steps as `this`.
The default world constructor is:

```javascript
class World {
    constructor({ attach, log, parameters }) {
        this.attach = attach
        this.log = log
        this.parameters = parameters
    }
}
```

* `attach`: function used for adding [attachments](./attachments.md) to hooks/steps
* `log`: function used for [logging](./attachments.md#logging) information from hooks/steps
* `parameters`: object of parameters passed in via the [CLI](../cli.md#world-parameters)

You can provide your own World class with its own properties and methods that help with your instrumentation. You can extend the built-in `World` with your own class and then call `setWorldConstructor` with it:

```javascript
const { setWorldConstructor, World } = require('@cucumber/cucumber')
const seleniumWebdriver = require('selenium-webdriver')

class CustomWorld extends World {
    driver = new seleniumWebdriver.Builder()
        .forBrowser('firefox')
        .build()
    
    constructor(options) {
        super(options)
    }
    
    // Returns a promise that resolves to the element
    async waitForElement(locator) {
        const condition = seleniumWebdriver.until.elementLocated(locator)
        return await this.driver.wait(condition)
    }
}

setWorldConstructor(CustomWorld)
```


