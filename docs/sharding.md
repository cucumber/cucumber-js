# Sharding

ℹ️ Added in v12.2.0

Sharding allows you to split your test suite across multiple separate test runs. This is useful when you want to run your tests in parallel across multiple machines or CI jobs, rather than using the [Parallel](./parallel.md) option which runs scenarios in parallel within a single test run.

You can enable sharding with the `shard` configuration option:

- In a configuration file `{ shard: '1/3' }`
- On the CLI `cucumber-js --shard 1/3`

The format is `INDEX/TOTAL` where:

- `INDEX` is the shard number (starting from 1)
- `TOTAL` is the total number of shards

For example, if you have 90 scenarios and use 3 shards, each shard will run 30 scenarios:

- Shard 1/3 runs scenarios 1, 4, 7, 10, ...
- Shard 2/3 runs scenarios 2, 5, 8, 11, ...
- Shard 3/3 runs scenarios 3, 6, 9, 12, ...

## CI workflows

A common use case is distributing tests across multiple CI jobs. For example, in GitHub Actions:

```yaml
jobs:
  test:
    strategy:
      matrix:
        shard: [1, 2, 3]
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm test -- --shard ${{ matrix.shard }}/3
```

This would create 3 parallel jobs, each running a different shard of your test suite, and ensuring all tests were run.

## Sharding and Parallel

Sharding is different to the long-standing [Parallel](./parallel.md) functionality because it splits execution across entirely independent processes, typically on different machines.

You can combine both approaches if you like: use sharding to split tests across multiple machines, and use parallel execution within each shard to use multiple cores on each machine.
