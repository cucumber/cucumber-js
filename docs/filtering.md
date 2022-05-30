# Filtering

You can use a few different configurations to have Cucumber filter which scenarios are run. This can be useful when you want to focus on a small subset of scenarios when developing or debugging.

## Paths

You can specify an individual feature file to be run:

- In a configuration file `{ paths: ['features/my_feature.feature'] }`
- On the CLI `$ cucumber-js features/my_feature.feature`

You can also specify a line within a file to target an individual scenario:

- In a configuration file `{ paths: ['features/my_feature.feature:3'] }`
- On the CLI `$ cucumber-js features/my_feature.feature:3`

This option is repeatable, so you can provide several values and they'll be combined.

## Names

You can specify a regular expression against which scenario names are tested to filter which should run:

- In a configuration file `{ name: ['^start.+end$'] }`
- On the CLI `$ cucumber-js --name "^start.+end$"`

To escape special regex characters in scenario name, use backslashes e.g., `\(Scenario Name\)`

This option is repeatable, so you can provide several expressions and they'll all be used, meaning a scenario just needs to match one of them.

## Tags

You can specify a [Cucumber tag expression](https://docs.cucumber.io/cucumber/api/#tag-expressions) to only run scenarios that match it:

- In a configuration file `{ tags: '@foo or @bar' }`
- On the CLI `$ cucumber-js --tags "@foo or @bar"`

This option is repeatable, so you can provide several expressions and they'll be combined with an `and` operator, meaning a scenario needs to match all of them.
