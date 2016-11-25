# Event Handlers

You can register event handlers for the following events within the cucumber lifecycle.

| Event          | Object                                           |
|----------------|--------------------------------------------------|
| BeforeFeatures | array of [Features](/src/models/feature.js)      |
| BeforeFeature  | [Feature](/src/models/feature.js)                |
| BeforeScenario | [Scenario](/src/models/scenario.js)              |
| BeforeStep     | [Step](/src/models/step.js)                      |
| StepResult     | [StepResult](/src/models/step_result.js)         |
| AfterStep      | [Step](/src/models/step.js)                      |
| ScenarioResult | [ScenarioResult](/src/models/scenario_result.js) |
| AfterScenario  | [Scenario](/src/models/scenario.js)              |
| AfterFeature   | [Feature](/src/models/feature.js)                |
| FeaturesResult | [FeaturesResult](/src/models/features_result.js) |
| AfterFeatures  | array of [Features](/src/models/feature.js)      |

Hooks also trigger `BeforeStep`, `StepResult`, and `AfterStep` events with the object
[HookStep](/src/models/hook_step.js)

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
