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

The `TYPE` can be one of:
* The name of one of the built-in formatters (below) e.g. `progress`
* A module/package name e.g. `@cucumber/pretty-formatter`
* A relative path to a local formatter implementation e.g. `./my-customer-formatter.js`

If `PATH` is not supplied, the formatter prints to `stdout`.
If `PATH` is supplied, it prints to the given file.

This option may be used multiple times in order to output different formats to different files.
If multiple formats are specified with the same output, only the last is used.

### Built-in formatters

* **message** - prints each [message](https://github.com/cucumber/cucumber/tree/master/cucumber-messages) in NDJSON form, which can then be consumed by other tools.
* **html** - prints a rich HTML report to a standalone page
* **json** - prints the feature as JSON. *Note: this formatter is in maintenance mode and won't have new features added to it. Where you need a structured data representation of your test run, it's best to use the `message` formatter. Tools that rely on this formatter will continue to work, but are encouraged to migrate to consume the `message` output instead.*
* **progress** - prints one character per scenario (default).
* **progress-bar** - prints a progress bar and outputs errors/warnings along the way.
* **rerun** - prints the paths of any non-passing scenarios ([example](/features/rerun_formatter.feature))
  * suggested use: add the rerun formatter to your default profile and the output file to your `.gitignore`.
  * After a failed run, remove any arguments used for selecting feature files and add the rerun file in order to rerun just failed scenarios. The rerun file must start with an `@` sign in order for cucumber to parse it as a rerun file instead of a feature file.
  * Use with `--fail-fast` to rerun the failure and the remaining features.
* **snippets** - prints just the code snippets for undefined steps.
* **summary** - prints a summary only, after all scenarios were executed.
* **usage** - prints a table with data about step definitions usage.
* **usage-json** - prints the step definitions usage data as JSON.

### Officially-supported standalone formatters

* [@cucumber/pretty-formatter](https://www.npmjs.com/package/@cucumber/pretty-formatter) - prints the feature with inline results,  colours and custom themes.

### Format Options

You can pass in format options with `--format-options <JSON>`. The JSON string must define an object. This option is repeatable and the objects will be merged with the last instance taking precedence.

* Suggested use: add with profiles so you can define an object and use `JSON.stringify` instead of writing `JSON` manually.

## Colors

Colors can be disabled with `--format-options '{"colorsEnabled": false}'`

## Exiting

By default, cucumber exits when the event loop drains. Use the `--exit` flag in order to force shutdown of the event loop when the test run has finished. This is discouraged, as fixing the issues that causes the hang is a better long term solution. Some potential resources for that are:
* [Node.js guide to debugging](https://nodejs.org/en/docs/inspector/)
* NPM package [why-is-node-running](https://www.npmjs.com/package/why-is-node-running)
* [Node.js Async Hooks](https://nodejs.org/dist/latest-v8.x/docs/api/async_hooks.html)
* Isolating what scenario or scenarios causes the hang

## --no-strict

disable _strict_ mode.

By default, cucumber works in _strict_ mode, meaning it will fail if there are pending steps.

## Undefined Step Snippets

Undefined steps snippets are printed in JavaScript using the callback interface by default.

### Interface

Override the snippet interface with `--format-options '{"snippetInterface": "<interface>"}'`.
Valid interfaces are 'async-await', 'callback', 'generator', 'promise', or 'synchronous'.

### Syntax

Override the snippet syntaxes with `--format-options '{"snippetSyntax": "<FILE>"}'`.
See [here](/docs/custom_snippet_syntaxes.md) for documentation about building a custom snippet syntax.

## Rerun separator

The separator used by the rerun formatter can be overwritten by specifying `--format-options '{"rerun": {"separator": "<separator>"}}'`.
This is useful when one needs to rerun failed tests locally by copying a line from a CI log while using a space character as a separator.
The default separator is a newline character.
Note that the rerun file parser can only work with the default separator for now.

## Parallel

You can run your scenarios in parallel with `--parallel <NUMBER_OF_WORKERS>`. Each worker is run in a separate Node process and receives the following env variables:

* `CUCUMBER_PARALLEL` - set to 'true'
* `CUCUMBER_TOTAL_WORKERS` - set to the number of workers
* `CUCUMBER_WORKER_ID` - ID for worker ('0', '1', '2', etc.)

### Timing

When using parallel mode, the last line of the summary output differentiates between real time elapsed during the test run and aggregate time spent actually running steps: 

```
73 scenarios (73 passed)
512 steps (512 passed)
0m51.627s (executing steps: 4m51.228s)
```

## Profiles

In order to store and reuse commonly used CLI options, you can add a `cucumber.js` file to your project root directory. The file should export an object where the key is the profile name and the value is a string of CLI options. The profile can be applied with `-p <NAME>` or `--profile <NAME>`. This will prepend the profile's CLI options to the ones provided by the command line. Multiple profiles can be specified at a time. If no profile is specified and a profile named `default` exists, it will be applied.

## Tags

Use `--tags <EXPRESSION>` to run specific features or scenarios. This option is repeatable and the expressions will be merged with an `and` operator.
`<EXPRESSION>` is a [cucumber tag expression](https://docs.cucumber.io/cucumber/api/#tag-expressions).

## --fail-fast

abort the run on first failure (default: false)

By default, cucumber-js runs the entire suite and reports all the failures. This flag allows a developer workflow where you work on one failure at a time. Combining this feature with rerun files allows you to work through all failures in an efficient manner.

A note on using in conjunction with `--retry`: we consider a test case to have failed if it exhausts retries and still fails, but passed if it passes on a retry having failed previous attempts, so `--fail-fast` does still allow retries to happen.

## Retry failing tests

Use `--retry <int>` to rerun tests that have been failing. This can be very helpful for flaky tests.
To only retry failing tests in a subset of test use `--retry-tag-filter <EXPRESSION>` (use the same as in Use [Tags](#tags))

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

You can pass in parameters to pass to the world constructor with `--world-parameters <JSON>`. The JSON string must define an object. The parsed object will be passed as the `parameters` to the the world constructor. This option is repeatable and the objects will be merged with the last instance taking precedence.

Example:

```
--world-parameters '{"fancySetting":true}'
```
