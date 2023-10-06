# Deprecations

From time to time, we'll deprecate and then remove functionality. This is not done lightly, and is normally a means to help move the project forward in a way that the old functionality is at odds with. We do this in a controlled way, to minimise disruption and give users plenty of time to adapt to the change.

Assuming a current major version of `N`:

1. A minor version (e.g. `N.x.x`) is released with the deprecation. This will normally involve:
   - A `@deprecated` comment in our code and types, which IDEs and other tools will recognise
   - A runtime warning the first time the deprecated functionality is invoked, where possible
2. Later, a major version (e.g. `N+1.0.0`) is released; the deprecation is highlighted in the release notes
3. Later still, another major version (e.g. `N+2.0.0`) is released with the deprecated functionality removed

In some cases, we might wait longer than `N+2.0.0` before removing functionality if the ecosystem needs more time to adapt.

## Current deprecations

### `Cli`

Deprecated in `8.7.0`, will be removed in `10.0.0` or later.

The `Cli` class is used internally to represent an instance of the command-line program invoked via `cucumber-js`. It can be used to run Cucumber programmatically, but is poorly suited for this.

To adapt, pivot to the `runCucumber` function from the [JavaScript API](./javascript_api.md), or raise an issue if you feel your use case isn't catered for.

### `parseGherkinMessageStream`

Deprecated in `8.0.0`, will be removed in `10.0.0` or later.

`parseGherkinMessageStream` is a way to process a stream of envelopes from Gherkin and resolve to an array of filtered, ordered pickle Ids. Its interface includes internal implementation details from Cucumber which are difficult to assemble.

To adapt, pivot to the `loadSources` function from the [JavaScript API](./javascript_api.md), or raise an issue if you feel your use case isn't catered for.

### `PickleFilter`

Deprecated in `8.7.0`, will be removed in `10.0.0` or later.

The `PickleFilter` class is used to provide a filter to the `parseGherkinMessageStream` function above.

To adapt, pivot to the `loadSources` function from the [JavaScript API](./javascript_api.md), or raise an issue if you feel your use case isn't catered for.

### `Runtime`

Deprecated in `8.7.0`, will be removed in `10.0.0` or later.

The `Runtime` class is used internally to represent an instance of the serial test case runner. Its interface includes internal implementation details from Cucumber which are difficult to assemble.

To adapt, pivot to the `runCucumber` function from the [JavaScript API](./javascript_api.md), or raise an issue if you feel your use case isn't catered for.

### publishQuiet

Deprecated in `9.4.0`. Will be removed in `11.0.0` or later.

The `publishQuiet` option (or `--publish-quiet` on the CLI) was used to hide the banner suggesting to use Cucumber Reports. The banner has since been removed, so the option now does nothing.

To adapt, remove the option from your configuration files and CLI commands (especially the latter, since the CLI will fail on unrecognised options).

### Ambiguous colons in formats

Deprecated in `9.6.0`. Will be removed in `11.0.0` or later.

User-specified formats where either the formatter name/path or the target path (or both) contains colon(s) are ambiguous because the separator between the two parts is also a colon. Cucumber tries to detect and handle things like Windows drives and `file://` URLs on a best-effort basis, but this logic is being removed in favour of wrapping values in double-quotes.

| Before                                       | After                                            |
|----------------------------------------------|--------------------------------------------------|
| `html:file://hostname/formatter/report.html` | `"html":"file://hostname/formatter/report.html"` |
| `file://C:\custom\formatter`                 | `"file://C:\custom\formatter"`                   |

## Previous deprecations

For deprecations that have been completed (i.e. the functionality removed), see [UPGRADING.md](../UPGRADING.md).
