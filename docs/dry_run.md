# Dry Run

You can run cucumber-js in "Dry Run" mode like this:

```shell
$ cucumber-js --dry-run
```

The effect is that cucumber-js will still do all the aggregation work of looking at your feature files, loading your support code etc but without actually executing the tests. Specifically:

- No [hooks](./support_files/hooks.md) are executed
- Steps are reported as "skipped" instead of being executed
- Undefined and ambiguous steps are reported, but don't cause the process to fail

A few examples where this is useful:

- Finding unused step definitions with the [usage formatter](./formatters.md#usage)
- Generating [snippets](./snippets.md) for all undefined steps with the [snippets formatter](./formatters.md#snippets)
- Checking if your path, tag expression etc matches the scenarios you expect it to

