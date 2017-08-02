# Custom Formatters

Custom formatters should be a javascript class. The constructor will be an options object which is the options defined with `--format-options` and the following:

* `colorFns`: a series of helper functions for outputting colors. See [here](/src/formatter/get_color_fns.js). Respects `colorsEnabled` option
* `cwd`: the current working directory
* `eventBroadcaster`: an event emitter that emits the event protocol (which is still being defined). See [current docs](https://docs.cucumber.io/event-protocol/) and the [proposed updates](https://github.com/cucumber/cucumber/pull/172) which were implemented.
* `eventDataCollector`: an instance of [EventDataCollector](/src/formatter/helpers/event_data_collector.js) which handles the complexity of grouping the data for related events
* `log`: function which will write the passed string to the the designated stream (stdout or the to file the formatter output is being redirected to).
* `snippetBuilder`: an object with a `build` method that should be called with `{keywordType, pickleStep}`. The `pickleStep` can be retrieved with the `eventDataCollector` while the `keywordType` is complex to compute (see the [SnippetsFormatter](/src/formatter/snippets_formatter.js) for an example).
* `stream`: the underlying stream the formatter is writing to. `log` is a shortcut for writing to it.

The constructor of custom formatters should add listeners to the `eventBroadcaster`.

See a couple examples [here](/features/custom_formatter.feature) and the built in formatters [here](/src/formatter)

## Extending Built-Ins

The base `Formatter` does very little aside from saving some of the options on the instance. You can extend the `SummaryFormatter` (as the `ProgressFormatter` and `PrettyFormatter`) do in order to get the same error reporting at the end.

`formatterHelpers` are also exposed to give some of the functionality in more modular pieces.

If there is any other formatter functionality you would like access to, please create an [issue](https://github.com/cucumber/cucumber-js).
