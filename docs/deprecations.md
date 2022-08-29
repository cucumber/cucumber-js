# Deprecations

From time to time, we'll deprecate and then remove functionality. This is not done lightly, and is normally a means to help move the project forward in a way that the old functionality is at odds with. We do this in a controlled way, to minimise disruption and give users plenty of time to adapt to the change.

Assuming a current major version of `N`:

1. A minor version (e.g. `N.x.x`) is released with the deprecation. This will normally involve:
   - A `@deprecated` comment in our code and types, which IDEs and other tools will recognise
   - A runtime warning the first time the deprecated functionality is invoked, where possible
2. Later, a major version (e.g. `N+1.0.0`) is released; the deprecation is highlighted in the release notes
3. Later still, another major version (e.g. `N+2.0.0`) is released with the deprecated functionality removed

## Current deprecations

### `defineStep`

Deprecated in `8.3.0`, will be removed in `10.0.0`.

`defineStep` is a way to generically define a step without tying it to any of the `Given`, `When` or `Then` keywords. This leads to ambiguity in the business language and is considered an antipattern; steps should be clearly applicable to one of those keywords, being a precondition, event or outcome respectively.

Consider reviewing your steps and defining them with the appropriate keyword, or just switching to `Given` as a first step. We're working on adding [an opt-in "strict mode" for keywords](https://github.com/cucumber/cucumber-js/issues/2043) which will yield an error when the keyword in the Gherkin text doesn't match that of the step definition, and could be used to pinpoint such issues in your project.
