# Frequently Asked Questions

## The world instance isn’t available in my hooks or step definitions.

If you are referencing the world instance (which is bound to `this`) in a step definition or hook, then you cannot use ES6 arrow functions.

Cucumber uses [apply](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/apply) internally to call your [step definition](./support_files/step_definitions.md) and
[hook](./support_files/hooks.md) functions using the world object as `this`.

Using `apply` [does not work with arrow functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions#call_apply_and_bind), so if you need to reference the world, use a regular `function`.

## Why do my definition patterns need to be globally unique instead of unique only within `Given`, `When`, `Then`?

To encourage a ubiquitous, non-ambiguous domain language.
Using the same language to mean different things is basically the definition of ambiguous.
If you have similar `Given` and `Then` patterns, try adding the word “should” to `Then` patterns.

## Why am I seeing `The "from" argument must be of type string. Received type undefined`?

See [Invalid installations](./installation.md#invalid-installations)
