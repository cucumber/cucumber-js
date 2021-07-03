# ES Modules (experimental)

You can optionally write your support code (steps, hooks, etc) with native ES modules syntax - i.e. using `import` and `export` statements without transpiling.

To enable this, run with the `--esm` CLI option.

This will also expand the default glob for support files to include the `.mjs` file extension (note that it's fine to still use the `.js` extension as well/instead).

Example (adapted from [our original example](./nodejs_example.md)):

```javascript
// features/support/steps.mjs
import { Given, When, Then } from '@cucumber/cucumber'
import { strict as assert } from 'assert'

Given('a variable set to {int}', function (number) {
  this.setTo(number)
})

When('I increment the variable by {int}', function (number) {
  this.incrementBy(number)
})

Then('the variable should contain {int}', function (number) {
  assert.equal(this.variable, number)
})
```

As well as support code, these things can also be in ES modules syntax:

- Custom formatters
- Custom snippets

You can use ES modules selectively/incrementally - the module loading strategy that the `--esm` flag activates supports both ES modules and CommonJS.
