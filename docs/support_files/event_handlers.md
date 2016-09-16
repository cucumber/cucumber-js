# Event Handlers

You can register event handlers for the following events within the cucumber lifecycle.

| Event          | Object                                            |
|----------------|-----------------------------------------------------------|
| BeforeFeatures | array of [Features](/lib/cucumber/ast/feature.js)          |
| BeforeFeature  | [Feature](/lib/cucumber/ast/feature.js)                    |
| BeforeScenario | [Scenario](/lib/cucumber/ast/scenario.js)                  |
| BeforeStep     | [Step](/lib/cucumber/ast/step.js)                          |
| StepResult     | [StepResult](/lib/cucumber/runtime/step_result.js)         |
| AfterStep      | [Step](/lib/cucumber/ast/step.js)                          |
| ScenarioResult | [ScenarioResult](/lib/cucumber/runtime/scenario_result.js) |
| AfterScenario  | [Scenario](/lib/cucumber/ast/scenario.js)                  |
| AfterFeature   | [Feature](/lib/cucumber/ast/feature.js)                    |
| FeaturesResult | [FeaturesResult](/lib/cucumber/runtime/features_result.js) |
| AfterFeatures  | array of [Features](/lib/cucumber/ast/feature.js)          |

Hooks also trigger `BeforeStep`, `StepResult`, and `AfterStep` events with the object
[HookStep](/lib/cucumber/ast/hook_step.js)

Handlers will be passed the associated object as the first argument.
Handlers can be synchronous, return a promise, accept an additional callback argument, or use generators.

```javascript
// features/support/handlers.js
var myHandlers = function () {
  this.registerHandler('AfterFeatures', function (features, callback) {
    // clean up!
    // There is no World instance available on `this`
    // because all scenarios are done and World instances are long gone.
    callback();
  });
}

module.exports = myHandlers;
```

Handlers timeout the same as steps / hooks and can have their timeout changed
by passing in an options object.

```javascript
// features/support/handlers.js
var myHandlers = function () {
  this.registerHandler('AfterFeatures', {timeout: 10000}, function (features, callback) {
    //...
  });
}

module.exports = myHandlers;
```
