# World

*World*, or sometimes *context*, is an isolated scope for each scenario, exposed to the steps and most hooks as `this`. It allows you to set variables in one step and recall them in a later step. All variables set this way are discarded when the scenario concludes. It is managed by a world class, either the default one or one you create. Each scenario is given an new instance of the class when the test starts, even if it is a [retry run](..retry.md).

The world is not available to the hooks `BeforeAll` or `AfterAll` as each of these executes outside any particular scenario.

##### Basic Example
```javascript
const { Given, Then } = require('@cucumber/cucumber')

Given("my color is {string}", function(color) {
  this.color = color
})

Then("my color should not be red", function() {
  if (this.color === "red") {
    throw new Error("Wrong Color");
  }
});
```
With those step definitions in place

```gherkin
Scenario: Will pass
  Given my color is "blue"
  Then my color should not be red

Scenario: Will fail
  Given my color is "red"
  Then my color should not be red  
```
**Important Note:** The following will NOT work as [arrow functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions) do not have their own bindings to `this` and are not suitable for the [apply](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/apply) method Cucumber uses internally to call your [step definitions](./support_files/step_definitions.md) and
[hooks](./support_files/hooks.md).

```javascript
// This WON'T work!!
Then("my color should not be blue", () => {
  if (this.color === "red") {
    throw new Error("Wrong Color");
  }
});
```

## Cucumber World

Cucumber provides a number of formatting helpers that are passed into the constructor of the World. The default world binds these helpers as follows:

* `this.attach`: a method for adding [attachments](./attachments.md) to hooks/steps
* `this.log`: a method for [logging](./attachments.md#logging) information from hooks/steps
* `this.parameters`: an object of parameters passed in via the [CLI](../cli.md#world-parameters)

Your custom world will also receive these arguments, but it up to you to decide what to do with them and they can be safely ignored.

### World Parameters

Tests often require configuration and environment information. One of the most frequent cases is web page tests that are using a browser driver; things like viewport, browser to use, application URL and so on.

The world parameters argument allows you to provide this information from the command line.  It takes the data in the form of a JSON literal after the `--world-parameters` CLI option, like this:

```shell
$ cucumber-js --world-parameters '{"appUrl":"http://localhost:3000/"}'
```

This option is repeatable, so you can use it multiple times and the objects will be merged with the later ones taking precedence.

Using JSON literals on the command line is tedious, but you can use [profiles](profiles.md) to create aliases for them.


## Custom Worlds

You might also want to have methods on your World that hooks and steps can access to keep their own code simple. To do this, you can provide your own World class with its own properties and methods that help with your instrumentation, and then call `setWorldConstructor` to tell Cucumber about it.

Let's walk through a typical scenario, setting up world that manages a browser context. We'll use the ES6 module syntax for this example.  First, let's set up our custom world. Class files should not be loaded as steps - they should be imported. So in this example we'll presume it is in a classes folder next to the steps folder.

###### CustomWorld.js
```javascript
import { World } from '@cucumber/cucumber';
import seleniumWebdriver from "selenium-webdriver";

/*
 * The only method to be inherited from the default world is
 * the constructor, so if you want to handle the options in
 * an entirely customized manner you don't have to extend from
 * World as seen here.
 */
export default class extends World {
  driver = null;

  /*
   * A constructor is only needed if you have custom actions
   * to take after the Cucumber parses the options or you
   * want to override how the options are parsed.
   * 
   * The options are an object with three members
   * {
   *   log: Cucumber log function,
   *   attach: Cucumber attachment function,
   *   params: World Parameters object
   * }
   */
  constructor(options) {
    /*
     * If you don't call the super method you will need
     * to bind the options here as you see fit.
     */
    super(options);
    // Custom actions go here.
  }

  /*
   * Constructors cannot be asynchronous! To work around this we'll
   * use an init method with the Before hook
   */
  async init(scenario) {
    this.driver = await seleniumWebdriver.Builder()
      .forBrowser(this.params.browser)
      .build();
  }
}
```

Now we'll use a step file to setup this custom world and declare the before hook.

###### setup.js
```javascript
import { Before, setWorldConstructor } from '@cucumber/cucumber';
import CustomWorld from "../classes/CustomWorld.js"

setWorldConstructor(CustomWorld);

Before(async function(scenario) {
  this.init(scenario);
});
```

Custom world classes can also be used as a point to anchor methods used by multiple steps. In a small project it is sufficient to put these methods in the world class file.  

```javascript
import { Given } from '@cucumber/cucumber';

Given("I'm viewing the admin settings", async function(){
  this.login("administrator");
  this.page.navigateTo("/admin/settings");
});
```

This pattern allows for cleaner feature files. Remember that, ideally, scenarios should be between 3-5 lines and communicate **what** the user is doing clearly to the whole team without going into the details of **how** it will be done. While steps can be reused that should not come at the expense of feature clarity.
