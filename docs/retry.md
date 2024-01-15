# Retry

*Note: if you want a mechanism to rerun just the failed scenarios when doing TDD, take a look at [Rerun](./rerun.md) instead.*

If you have a flaky scenario (e.g. failing 10% of the time for some reason), you can use *Retry* to have Cucumber attempt it multiple times until either it passes or the maximum number of attempts is reached. You enable this via the `retry` configuration option, like this:

- In a configuration file `{ retry: 1 }`
- On the CLI `cucumber-js --retry 1`

The number you provide is the number of retries that will be allowed after an initial failure.

*Note:* Retry isn't recommended for routine use, but can be a good trade-off in some situations where you have a scenario that's too valuable to remove, but it's either not possible or not worth the effort to fix the flakiness.

Some notes on how Retry works:

- Only relevant failing scenarios are retried, not the whole test run. 
- When a scenario is retried, it runs all hooks and steps again from the start with a fresh [World](./support_files/world.md) - nothing is retained from the failed attempt.
- When a scenario passes on a retry, it's treated as a pass overall in the results, although the details of each attempt are emitted so formatters can access them.

## Targeting scenarios

Using the `retry` option alone would mean every scenario would be allowed multiple attempts - this almost certainly isn't what you want, assuming you have a small set of flaky scenarios. To target just the relevant scenarios, you can provide a [tag expression](https://cucumber.io/docs/cucumber/api/#tag-expressions) via the `retryTagFilter` configuration option, like this:

- In a configuration file `{ retry: 1, retryTagFilter: '@flaky' }`
- On the CLI `cucumber-js --retry 1 --retry-tag-filter @flaky`
