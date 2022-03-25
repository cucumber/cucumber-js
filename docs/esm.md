# ES Modules (experimental)

You can optionally write your support code (steps, hooks, etc) with native ES modules syntax - i.e. using `import` and `export` statements without transpiling.

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

- Custom formatters
- Custom snippets

You can use ES modules selectively/incrementally - so you can have a mixture of CommonJS and ESM in the same project.

## Configuration file

You can write your [configuration file](./configuration.md#files) in ESM format. Here's an example adapted from our [Profiles](./profiles.md) doc:

```javascript
const common = {
  requireModule: ['ts-node/register'],
  require: ['support/**/*.ts'],
  worldParameters: {
    appUrl: process.env.MY_APP_URL || 'http://localhost:3000/'
  }
}

export default {
  ...common,
  format: ['progress-bar', 'html:cucumber-report.html'],
}

export const ci = {
  ...common,
  format: ['html:cucumber-report.html'],
  publish: true
}
```

## Transpiling

When using a transpiler for e.g. TypeScript, ESM isn't supported - you'll need to configure your transpiler to output modules in CommonJS syntax (for now). See [this GitHub issue](https://github.com/cucumber/cucumber-js/issues/1844) for the latest on support for ESM loaders.
