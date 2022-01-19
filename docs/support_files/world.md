# World

*World* is an isolated context for each scenario, exposed to the hooks and steps as `this`, enabling you to set and recall some state across the lifecycle of your scenario. It is managed by a world class and each scenario is given an instance of the class when the test starts. You can use a default world that is part of Cucumber or create your own.

Note that your hooks and step definition functions cannot reference the world as `this` if you use arrow functions. See [FAQ](../faq.md) for details.

The simplest example is to relay values between steps.

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

## Cucumber World

The default world provided by Cucumber provides a number of formatting helpers that are passed into the constructor:

* `this.attach`: a method for adding [attachments](./attachments.md) to hooks/steps
* `this.log`: a method for [logging](./attachments.md#logging) information from hooks/steps
* `this.parameters`: an object of parameters passed in via the [CLI](../cli.md#world-parameters)


### World Parameters

You might want to provide some configuration/environmental data to your World at runtime. You can provide this data as a JSON literal via the `--world-parameters` CLI option, like this:

```shell
$ cucumber-js --world-parameters '{"appUrl":"http://localhost:3000/"}'
```

This option is repeatable, so you can use it multiple times and the objects will be merged with the later ones taking precedence.

Using JSON literals on the command line is tedious, but you can use [profiles](profiles.md) to create aliases for them.

This data is then available on `this.parameters` from your hooks and steps.

## Custom Worlds

You might also want to have methods on your World that hooks and steps can access to keep their own code simple. To do this, you can provide your own World class with its own properties and methods that help with your instrumentation, and then call `setWorldConstructor` to tell Cucumber about it.

Let's walk through a typical scenario, setting up world that manages a browser context. We'll use the ES6 module syntax for this example.  First, let's set up our custom world. Class files should not be loaded as steps - they should be imported. So in this example we'll presume it is in a classes folder next to the steps folder.

###### CustomWorld.js
```javascript
import { World } from '@cucumber/cucumber';
import seleniumWebdriver from "selenium-webdriver";

export default class extends World {
  driver = null;

  /*
   * A constructor is only needed if you have custom actions
   * to take after the Cucumber parses the options.
   */
  constructor(options) {
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

Custom world classes can also be used as a point to anchor methods used by multiple steps by using the prototype of the custom world. For example, the login step of your application should contain the login process:

###### login.js
```javascript
import { Given } from '@cucumber/cucumber';
import CustomWorld from "../classes/CustomWorld.js"

Given("I am an {string}", function(userType) {
  this.login(userType)
})

CustomWorld.prototype.login(userType) {
  // Perform whatever actions necessary to login a user here.
}
```

This sort of division allows the world context to be quite large without having to slog through a monster class declaration file. Now consider a test for a page that can't be reached unless you're logged in. That step can reuse the login process.

###### admin_settings.js
```javascript
import { Given } from '@cucumber/cucumber';

Given("I'm viewing the admin settings", async function(){
  this.login("administrator");
  this.page.navigateTo("/admin/settings");
});
```

This pattern allows for cleaner feature files. Remember that, ideally, scenarios should be between 3-5 lines and communicate what the user is doing clearly to the whole team. While steps can be reused that should not come at the expense of feature clarity.
