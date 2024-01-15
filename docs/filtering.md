# Filtering and Ordering

You can use a few different configurations to have Cucumber filter which scenarios are run. This can be useful when you want to focus on a small subset of scenarios when developing or debugging.

## Paths

You can specify an individual feature file to be run:

- In a configuration file `{ paths: ['features/my_feature.feature'] }`
- On the CLI `cucumber-js features/my_feature.feature`

You can also specify a line within a file to target an individual scenario:

- In a configuration file `{ paths: ['features/my_feature.feature:3'] }`
- On the CLI `cucumber-js features/my_feature.feature:3`

This option is repeatable, so you can provide several values and they'll be combined.

## Names

You can specify a regular expression against which scenario names are tested to filter which should run:

- In a configuration file `{ name: ['^start.+end$'] }`
- On the CLI `cucumber-js --name "^start.+end$"`

To escape special regex characters in scenario name, use backslashes e.g., `\(Scenario Name\)`

This option is repeatable, so you can provide several expressions and they'll all be used, meaning a scenario just needs to match one of them.

## Tags

You can specify a [Cucumber tag expression](https://docs.cucumber.io/cucumber/api/#tag-expressions) to only run scenarios that match it:

- In a configuration file `{ tags: '@foo or @bar' }`
- On the CLI `cucumber-js --tags "@foo or @bar"`

This option is repeatable, so you can provide several expressions and they'll be combined with an `and` operator, meaning a scenario needs to match all of them.

## Order

You can specify the order that scenarios should run in:

- In a configuration file `{ order: 'defined' }`
- On the CLI `cucumber-js --order defined`

The default is `defined` where scenarios are run in the order they are discovered in. This roughly means alphabetical order of file path followed by sequential order within each file, although if you pass multiple globs/paths to the `paths` option this order will be honoured.

You can also specify `random` to shuffle the scenarios randomly, and optionally specify a seed like `random:234119`.
