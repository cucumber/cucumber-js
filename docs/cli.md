# CLI

Cucumber.js includes an executable file to run the features. After installing Cucumber in your project, you can run it with:

``` shell
$ ./node_modules/.bin/cucumber-js
```

**Note on global installs:** Cucumber does not work when installed globally because cucumber
needs to be required in your support files and globally installed modules cannot be required.

## Running specific features

* Specify a [glob](https://github.com/isaacs/node-glob) pattern
  * `$ cucumber-js features/**/*.feature`
* Specify a feature directory
  * `$ cucumber-js features/dir`
* Specify a feature file
  * `$ cucumber-js features/my_feature.feature`
* Specify a scenario by its line number
  * `$ cucumber-js features/my_feature.feature:3`
* Specify a scenario by its name matching a regular expression
  * `$ cucumber-js --name "topic 1"`
  * `$ cucumber-js --name "^start.+end$"`
  * If used multiple times, the scenario name needs to match only one of the names supplied
  * To escape special regex characters in scenario name, use backslash e.g., `\(Scenario Name\)`
* Use [Tags](#tags)

## Requiring support files

By default, the following files are required:
* If the features live in a `features` directory (at any level)
  * `features/**/*.js`
* Otherwise
  * `<DIR>/**/*.js` for each directory containing the selected features

Alternatively, you can use `--require <GLOB|DIR|FILE>` to explicitly require support files before executing the features. Uses [glob](https://github.com/isaacs/node-glob) patterns.

This option may be used multiple times in order to e.g. require files from several different locations.

_Note that once you specify any `--require` options, the defaults described above are no longer applied._

## Formats

Use `--format <TYPE[:PATH]>` to specify the format of the output.

See [Formatters](./formatters.md).

### Officially-supported standalone formatters

* [@cucumber/pretty-formatter](https://www.npmjs.com/package/@cucumber/pretty-formatter) - prints the feature with inline results,  colours and custom themes.

### Format Options

You can pass in format options with `--format-options <JSON>`.

See [Formatters](./formatters.md).

## Exiting

By default, cucumber exits when the event loop drains. Use the `--exit` flag in order to force shutdown of the event loop when the test run has finished. This is discouraged, as fixing the issues that causes the hang is a better long term solution. Some potential resources for that are:
* [Node.js guide to debugging](https://nodejs.org/en/docs/inspector/)
* NPM package [why-is-node-running](https://www.npmjs.com/package/why-is-node-running)
* [Node.js Async Hooks](https://nodejs.org/dist/latest-v8.x/docs/api/async_hooks.html)
* Isolating what scenario or scenarios causes the hang

## --no-strict

disable _strict_ mode.

By default, cucumber works in _strict_ mode, meaning it will fail if there are pending steps.

## Parallel

See [Parallel](./parallel.md).

## Profiles

See [Profiles](./profiles.md).

## Tags

Use `--tags <EXPRESSION>` to run specific features or scenarios. This option is repeatable and the expressions will be merged with an `and` operator.
`<EXPRESSION>` is a [cucumber tag expression](https://docs.cucumber.io/cucumber/api/#tag-expressions).

## --fail-fast

abort the run on first failure (default: false)

By default, cucumber-js runs the entire suite and reports all the failures. This flag allows a developer workflow where you work on one failure at a time. Combining this feature with rerun files allows you to work through all failures in an efficient manner.

A note on using in conjunction with `--retry`: we consider a test case to have failed if it exhausts retries and still fails, but passed if it passes on a retry having failed previous attempts, so `--fail-fast` does still allow retries to happen.

## Retry failing tests

See [Retry](./retry.md)

## Transpilation

Step definitions and support files can be written in other languages that transpile to JavaScript.

### Simple ES6 support

For instance, for ES6 support with [Babel](https://babeljs.io/) 7 add:

```
--require-module @babel/register
```

This will effectively call `require('@babel/register')` prior to requiring any support files.

If your files end with an extension other than `js`, make sure to also include the `--require` option to state the required support files. For example, if using [CoffeeScript](https://www.npmjs.com/package/coffeescript):

```
--require-module coffeescript/register --require 'features/**/*.coffee'
```

### TypeScript

Your `tsconfig.json` should have the `resolveJsonModule` compiler option switched on. Other than that, a pretty standard TypeScript setup should work as expected.

#### With ts-node

If you are using [ts-node](https://github.com/TypeStrong/ts-node):

```
--require-module ts-node/register --require 'step-definitions/**/*.ts'
```

> ⚠️ Some TypeScript setups use `esnext` modules by default, 
>   which doesn't marry well with Node. You may consider using commonjs instead.
>   See how to add [extra configuration](#extra-configuration) below.

#### With babel

If you are using babel with [@babel/preset-typescript](https://babeljs.io/docs/en/babel-preset-typescript):

```
--require-module @babel/register --require 'step-definitions/**/*.ts'
```

### Extra Configuration

Sometimes the required module (say `@ts-node/register`) needs extra configuration. For example, you might want to configure it such that it prevents the compiled JS being written out to files, and pass some compiler options. In such cases, create a script (say, `tests.setup.js`):

```js
require('ts-node').register({
  transpileOnly: true,
  compilerOptions: {
    "module": "commonjs",
    "resolveJsonModule": true,
  },
});
```

And then require it using the `--require` option:

```
--require tests.setup.js --require 'features/**/*.ts'
```

Note that the first `--require tests.setup.js` overrides the default require glob, so we'll need to `--require` our support code explicitly too.

## World Parameters

See [World](./support_files/world.md).
