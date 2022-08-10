# Custom Formatters

Custom formatters should be a javascript class. The constructor will be an options object with the following properties:

* `colorFns`: a series of helper functions for outputting colors. See [here](/src/formatter/get_color_fns.ts). Respects `colorsEnabled` option
* `cwd`: the current working directory
* `eventBroadcaster`: an event emitter that emits cucumber-messages
* `eventDataCollector`: an instance of [EventDataCollector](/src/formatter/helpers/event_data_collector.ts) which handles the complexity of grouping the data for related events
* `log`: function which will write the passed string to the the designated stream (stdout or the to file the formatter output is being redirected to).
* `parsedArgvOptions`: an object of everything passed to `--format-options`
* `snippetBuilder`: an object with a `build` method that should be called with `{keywordType, pickleStep}`. The `pickleStep` can be retrieved with the `eventDataCollector` while the `keywordType` is complex to compute (see the [SnippetsFormatter](/src/formatter/snippets_formatter.ts) for an example).
* `stream`: the underlying stream the formatter is writing to. `log` is a shortcut for writing to it.
* `supportCodeLibrary`: an object containing the step and hook definitions

The constructor of custom formatters should add listeners to the `eventBroadcaster`.

See a couple examples [here](/features/custom_formatter.feature) and the built in formatters [here](/src/formatter)

## Extending Built-Ins

The base `Formatter` does very little aside from saving some of the options on the instance. You can extend the `SummaryFormatter` (as the `ProgressFormatter` does) in order to get the same error reporting at the end.

`formatterHelpers` are also exposed to give some of the functionality in more modular pieces.

If there is any other formatter functionality you would like access to, please create an [issue](https://github.com/cucumber/cucumber-js).

## Testing

To test your formatter with a good degree of confidence, you probably want to run Cucumber with a predefined set of features and support code, and then assert that the output from your formatter is what you'd expect.

We take this approach with the official [`@cucumber/pretty-formatter`](https://github.com/cucumber/cucumber-js-pretty-formatter), using the [JavaScript API](./javascript_api.md) to run Cucumber in-process and grabbing the result from its `stdout` to compare against a fixture file. Take a look at [the `run`  helper function](https://github.com/cucumber/cucumber-js-pretty-formatter/blob/main/test/exec.ts#L19) for some hints on how to go about this.

## Distribution

If you want to share your formatter with other users, [publish it as an npm package](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry) and make sure your formatter class is the default export of the entry point defined in `package.json` - that way users will be able to just reference it by the package name when running cucumber-js, once they've added it as a dependency.
