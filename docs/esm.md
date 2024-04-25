# ES Modules (experimental)

You can optionally write your support code (steps, hooks, etc) with native ES modules syntax - i.e. using `import` and `export` statements without transpiling to CommonJS.

If your support code is written as ESM, you'll need to use the `import` configuration option to specify your files, rather than the `require` option, although we do automatically detect and import any `.mjs` files found within your features directory.

Example:

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

- [Configuration files](./configuration.md#files)
- [Custom formatters](./custom_formatters.md)
- [Custom snippets](./custom_snippet_syntaxes.md)

You can use ES modules selectively/incrementally - so you can have a mixture of CommonJS and ESM in the same project.

## Transpiling

See [Transpiling](./transpiling.md#esm) for how to do just-in-time compilation that outputs ESM.