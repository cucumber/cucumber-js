# CLI

Cucumber.js includes a executable file to run the features.

If you installed Cucumber.js globally, you may run it with:

```shell
$ cucumber.js
```

If you installed Cucumber locally, you may need to specify the path to the executable:

``` shell
$ ./node_modules/.bin/cucumber.js
```

The executable is also aliased as `cucumber-js` and `cucumberjs`.

**Note to Windows users:** Use `cucumber-js` or `cucumberjs` instead of `cucumber.js`.
The latter is causing the operating system to invoke JScript instead of Node.js,
because of the file extension.

## Running specific features

* Specify a feature file
  * `$ cucumber.js features/my_feature.feature`
* Specify a scenario by its line number
  * `$ cucumber.js features/my_feature.feature:3`
* Specify a scenario by its name matching a regular expression
  * `$ cucumber.js --name "topic 1"`
  * If used multiple times, the scenario name needs to match only one of the names supplied
* Use [Tags](#tags)

## Requiring support files

Use `--require <FILE|DIR>` to require files before executing the features.
If not used, the following files are required:
* If the features live in a `features` folder
  * all support files in the `features` folder are loaded
* Otherwise
  * all support files that are siblings or below the features are loaded
Support files are defined as all `*.js` files and other extensions specified by `--compiler`.
Automatic loading is disabled when this option is specified, and all loading becomes explicit.

## Formats

Use `--format <TYPE[:PATH]>` to specify the format of the output.
If PATH is not supplied, the formatter prints to stdout.
If PATH is supplied, it prints to the given file.
If multiple formats are specified with the same output, only the last is used.

Built-in formatters
* json - prints the feature as JSON
* pretty - prints the feature as is (default)
* progress - prints one character per scenario
* rerun - prints the paths of any non passing scenarios ([example](/features/rerun_formatter.feature))
  * suggested use: add the rerun formatter to your default profile and the output file to your `.gitignore`. Use with `--fail-fast` to rerun the failure and the remaining features.
* snippets - prints just the code snippets for undefined steps
* summary - prints a summary only, after all scenarios were executed

### Format Options

You can pass in format options with `--format-options <JSON>`. The JSON string must define an object. This option is repeatable and the objects will be merged with the last instance taking precedence.

* Suggested use: add with profiles so you can define an object and use `JSON.stringify` instead of writing `JSON` manually.

## Colors

Colors can be disabled with `--format-options '{"colorsEnabled": false}'`

## Undefined Step Snippets

Undefined steps snippets are printed in javascript using the callback interface by default.

### Interface

Override the snippet interface with `--format-option '{"snippetInterface": "<interface>"}'`.
Valid interfaces are 'callback', 'generator', 'promise', or 'synchronous'.

### Syntax

Override the snippet syntaxes with `--format-option '{"snippetSyntax": "<FILE>"}'`.
See [here](/features/step_definition_snippets_custom_syntax.feature) for an example.

#### Building a custom snippet syntax

* See the [JavaScript syntax](/src/formatters/snippet_builder/javascript_syntax.js) for an example. Please open an issue if you need more information.
* Please add the keywords `cucumber` and `snippets` to your package, so it can easily be found by searching [npm](https://www.npmjs.com/search?q=cucumber+snippets).

## Profiles

In order to store and reuse commonly used CLI options, you can add a `cucumber.js` file to your project root directory. The file should export an object where the key is the profile name and the value is a string of CLI options. The profile can be applied with `-p <NAME>` or `--profile <NAME>`. This will prepend the profile's CLI options to the ones provided by the command line. Multiple profiles can be specified at a time. If no profile is specified and a profile named `default` exists, it will be applied.

## Tags

Use `--tags <EXPRESSION>` to run specific features or scenarios.
`<EXPRESSION>` is a [cucumber tag expression](https://docs.cucumber.io/tag-expressions/).

## Transpilers

Step definitions and support files can be written in other languages that transpile to javascript. To do this use the CLI option `--compiler <file_extension>:<module_name>`. Running `require("<module_name>")`, should make it possible to require files with the given extension. As an example, load [CoffeeScript](https://www.npmjs.com/package/coffee-script) support files with `--compiler coffee:coffee-script/register`.

## World Parameters

You can pass in parameters to pass to the world constructor with `--world-parameters <JSON>`. The JSON string must define an object. The parsed object will be passed as the `parameters` to the the world constructor. This option is repeatable and the objects will be merged with the last instance taking precedence.
