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

### Paths in configuration and CLI

Announced in `12.7.0`, will change in `14.0.0` or later.

When you provide paths in both your configuration file _and_ as command line arguments, Cucumber currently merges these options. So given this configuration:

```yaml
default:
  paths:
    - "features/**/*.feature"
```

And this invocation on the command line:

```shell
cucumber-js features/auth.feature
```

The resolved "paths" option will be:

```json
[
  "features/**/*.feature",
  "features/auth.feature"
]
```

Meaning everything will be run. This probably isn't what you want.

In a future release, we'll change it so that the command line argument(s) _override_ the configuration rather than merge with it. So going back to our example, the resolved "paths" option will then be:

```json
[
  "features/auth.feature"
]
```

This will be unlike all other configuration options - no others are changing. However, in the case of paths we think this makes the most sense.

### `Cli`

Deprecated in `8.7.0`, will be removed in `10.0.0` or later.

The `Cli` class is used internally to represent an instance of the command-line program invoked via `cucumber-js`. It can be used to run Cucumber programmatically, but is poorly suited for this.

To adapt, pivot to the `runCucumber` function from the [JavaScript API](./javascript_api.md), or raise an issue if you feel your use case isn't catered for.

### Ambiguous colons in formats

Deprecated in `9.6.0`. Will be removed in `11.0.0` or later.

User-specified formats where either the formatter name/path or the target path (or both) contains colon(s) are ambiguous because the separator between the two parts is also a colon. Cucumber tries to detect and handle things like Windows drives and `file://` URLs on a best-effort basis, but this logic is being removed in favour of wrapping values in double-quotes.

| Before                                       | After                                            |
|----------------------------------------------|--------------------------------------------------|
| `html:file://hostname/formatter/report.html` | `"html":"file://hostname/formatter/report.html"` |
| `file://C:\custom\formatter`                 | `"file://C:\custom\formatter"`                   |

### `colorsEnabled` format option

Deprecated in `12.6.0`, will be removed in `14.0.0` or later.

The `colorsEnabled` format option allows you to forcibly enable or disable colored output from formatters. This is being removed in favour of using the `FORCE_COLOR` environment variable, which is a cross-tool standard that will also influence other tools in your stack such as assertion libraries.

In `13.0.0`, the option's behaviour will change to set the `FORCE_COLOR` environment variable under the hood. In `14.0.0`, the option will be removed entirely.

To adapt:

| Before | After |
|--------|-------|
| `--format-options '{"colorsEnabled":true}'` | `FORCE_COLOR=1` |
| `--format-options '{"colorsEnabled":false}'` | `FORCE_COLOR=0` |

## Previous deprecations

For deprecations that have been completed (i.e. the functionality removed), see [UPGRADING.md](../UPGRADING.md).
