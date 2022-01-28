# World

*World* is an isolated context for each scenario, exposed to the hooks and steps as `this`, enabling you to set and recall some state across the lifecycle of your scenario.

Note that your hooks and step definition functions cannot reference the world as `this` if you use
arrow functions. See [FAQ](../faq.md) for details.

A simple example:

```javascript
const { When } = require('@cucumber/cucumber')

When('something happens', async function() {
  this.foo = 'bar'
})
```

As well as being able to have arbitrary state, you get some helpers preset on the World for you:

* `this.attach`: function used for adding [attachments](./attachments.md) to hooks/steps
* `this.log`: function used for [logging](./attachments.md#logging) information from hooks/steps
* `this.parameters`: object of parameters passed in via the [CLI](../cli.md#world-parameters)

Some notes on the scope of World:

- It's scoped to a single scenario only - not shared globally between scenarios. This reinforces a Cucumber principle: that scenarios should work entirely independently of one another.
- If you're using [Retry](../retry.md), you'll get a fresh World for every attempt at your scenario, so state isn't retained between attempts.

## World Parameters

You might want to provide some configuration/environmental data to your World at runtime. You can provide this data as a JSON literal via the `--world-parameters` CLI option, like this:

```shell
$ cucumber-js --world-parameters '{"appUrl":"http://localhost:3000/"}'
```

This option is repeatable, so you can use it multiple times and the objects will be merged with the later ones taking precedence.

This data is then available on `this.parameters` from your hooks and steps.

## Custom World

You might also want to have methods on your World that hooks and steps can access to keep their own code simple. To do this, you can provide your own World class with its own properties and methods that help with your instrumentation, and then call `setWorldConstructor` to tell Cucumber about it. You should extend the built-in `World` class:

```javascript
const { setWorldConstructor, World } = require('@cucumber/cucumber')
const seleniumWebdriver = require('selenium-webdriver')

class CustomWorld extends World {
    driver = new seleniumWebdriver.Builder()
        .forBrowser('firefox')
        .build()

    constructor(options) {
        // needed so `attach`, `log` and `parameters` are properly set
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
