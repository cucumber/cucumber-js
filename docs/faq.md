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

If when running cucumber-js you see an error with a stack trace like:

```
TypeError [ERR_INVALID_ARG_TYPE]: The "from" argument must be of type string. Received type undefined
    at validateString (internal/validators.js:125:11)
    at Object.relative (path.js:1162:5)
    ...
```

This usually an effect of one of:

- Your project depends on cucumber-js, and also has a dependency (in `node_modules`) that depends on cucumber-js at a different version
- You have a package that depends (even as a dev dependency) on cucumber-js linked (via `npm link` or `yarn link`)

These cases can cause two different instances of cucumber-js to be in play at runtime, which causes errors.

If removing the duplicate dependency is not possible, you can work around this by using [import-cwd](https://www.npmjs.com/package/import-cwd) so your support code always requires cucumber-js from the current working directory (i.e. your host project):

```js
const importCwd = require('import-cwd')
const { Given, When, Then } = importCwd('@cucumber/cucumber')
```
