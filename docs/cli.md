# CLI

Cucumber.js includes a executable file to run the features. After installing Cucumber in your project, you can run it with:

``` shell
$ ./node_modules/.bin/cucumber.js
```

The executable is also aliased as `cucumber-js` and `cucumberjs`.

**Note to Windows users:** Use `cucumber-js` or `cucumberjs` instead of `cucumber.js`.
The latter is causing the operating system to invoke JScript instead of Node.js,
because of the file extension.

**Note on global installs:** Cucumber does not work when installed globally because cucumber
needs to be required in your support files and globally installed modules cannot be required.

## Running specific features

* Specify a [glob](https://github.com/isaacs/node-glob) pattern
  * `$ cucumber.js features/**/*.feature`
* Specify a feature directory
  * `$ cucumber.js features/dir`
* Specify a feature file
  * `$ cucumber.js features/my_feature.feature`
* Specify a scenario by its line number
  * `$ cucumber.js features/my_feature.feature:3`
* Specify a scenario by its name matching a regular expression
  * `$ cucumber.js --name "topic 1"`
  * If used multiple times, the scenario name needs to match only one of the names supplied
* Use [Tags](#tags)

## Requiring support files

Use `--require <GLOB|DIR|FILE>` to require support files before executing the features. Uses [glob](https://github.com/isaacs/node-glob) patterns.
If not used, the following files are required:
* If the features live in a `features` directory (at any level)
  * `features/**/*.js`
* Otherwise
  * `<DIR>/**/*.js` for each directory containing the selected features

Automatic loading is disabled when this option is specified, and all loading becomes explicit.

## Formats

Use `--format <TYPE[:PATH]>` to specify the format of the output.
If PATH is not supplied, the formatter prints to stdout.
If PATH is supplied, it prints to the given file.
This option may be used multiple times in order to output different formats to different files.
If multiple formats are specified with the same output, only the last is used.

Built-in formatters
* event-protocol - prints the event protocol. See [current docs](https://docs.cucumber.io/event-protocol/) and the [proposed updates](https://github.com/cucumber/cucumber/pull/172) which were implemented.
* json - prints the feature as JSON.
* progress - prints one character per scenario (default).
* progress-bar - prints a progress bar and outputs errors/warnings along the way.
* rerun - prints the paths of any non passing scenarios ([example](/features/rerun_formatter.feature))
  * suggested use: add the rerun formatter to your default profile and the output file to your `.gitignore`.
  * After a failed run, remove any arguments used for selecting feature files and add the rerun file in order to rerun just failed scenarios. The rerun file must start with `@` sign in order for cucumber to parse it as a rerun file instead of a feature file.
  * Use with `--fail-fast` to rerun the failure and the remaining features.
* snippets - prints just the code snippets for undefined steps.
* summary - prints a summary only, after all scenarios were executed.
* usage - prints a table with data about step definitions usage.
* usage-json - prints the step definitions usage data as JSON.

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

## Undefined Step Snippets

Undefined steps snippets are printed in javascript using the callback interface by default.

### Interface

Override the snippet interface with `--format-options '{"snippetInterface": "<interface>"}'`.
Valid interfaces are 'callback', 'generator', 'promise', or 'synchronous'.

### Syntax

Override the snippet syntaxes with `--format-options '{"snippetSyntax": "<FILE>"}'`.
See [here](/docs/custom_snippet_syntaxes.md) for documentation about building a custom snippet syntax.

## Rerun separator

The separator used by the rerun formatter can be overwritten by specifying `--format-options '{"rerun": {"separator": "<separator>"}}'`.
This is useful when one needs to rerun failed tests locally by copying a line from a CI log while using a space character as a separator.
The default separator is a newline character.
Note that the rerun file parser can only work with the default separator for now.

## Parallel

You can run your scenarios in parallel with `--parallel <NUMBER_OF_SLAVES>`. Each slave is run in a separate node process and receives the following env variables:
* `CUCUMBER_PARALLEL` - set to 'true'
* `CUCUMBER_TOTAL_SLAVES` - set to the number of slaves
* `CUCUMBER_SLAVE_ID` - id for slave ('0', '1', '2', etc)

## Profiles

In order to store and reuse commonly used CLI options, you can add a `cucumber.js` file to your project root directory. The file should export an object where the key is the profile name and the value is a string of CLI options. The profile can be applied with `-p <NAME>` or `--profile <NAME>`. This will prepend the profile's CLI options to the ones provided by the command line. Multiple profiles can be specified at a time. If no profile is specified and a profile named `default` exists, it will be applied.

## Tags

Use `--tags <EXPRESSION>` to run specific features or scenarios. This option is repeatable and the expressions will be merged with `and` operator.
`<EXPRESSION>` is a [cucumber tag expression](https://docs.cucumber.io/tag-expressions/).

## Transpilers

Step definitions and support files can be written in other languages that transpile to javascript. To do this use the CLI option `--require-module <module_name>`, where `require("<module_name>")` should make it possible to require files for your language. Also use `--require features/**/*.<ext>` if your files end in an extension other than `js`. As an example, load [CoffeeScript](https://www.npmjs.com/package/coffee-script) support files with `--require-module coffee-script/register --require features/**/*.coffee`.

## World Parameters

You can pass in parameters to pass to the world constructor with `--world-parameters <JSON>`. The JSON string must define an object. The parsed object will be passed as the `parameters` to the the world constructor. This option is repeatable and the objects will be merged with the last instance taking precedence.
