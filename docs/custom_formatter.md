# Custom Formatters

Custom formatters should be a javascript class. The constructor will be an options object  which is the options defined with `--format-options` and the following:

* `colorFns`: a series of helper functions for outputting colors. See [here](/src/formatters/get_color_fns). Respects `colorsEnabled` option
* `cwd`: the current working directory
* `log`: function which will write the passed string to the the designated stream (stdout or the to file the formatter output is being redirected to).
* `snippetBuilder`: an object with a `build` method that should be called with a [step](/src/models/step.js) to get the snippet for an undefined step

Custom formatters should then define instance methods in order to output something during a particular event. For example it should define a `handleBeforeFeatures` function in order to output something as cucumber is starting.

See a couple examples [here](/features/custom_formatter.feature) and the built in formatters [here](/src/formatter)

## Extending Built-Ins

The base `Formatter` does very little aside from saving some of the options on the instance. You can extend the `SummaryFormatter` (as the `ProgressFormatter` and `PrettyFormatter`) do in order to get the same error reporting at the end.

If there is any formatter functionality you would like access to but don't necessarily want to extend from, please create an [issue](https://github.com/cucumber/cucumber-js).
