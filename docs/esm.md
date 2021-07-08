# ES Modules (experimental)

You can optionally write your support code (steps, hooks, etc) with native ES modules syntax - i.e. using `import` and `export` statements without transpiling. This is enabled without any additional configuration, and you can use either of the `.js` or `.mjs` file extensions.

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

You can use ES modules selectively/incrementally - so you can have a mixture of CommonJS and ESM in the same project.
