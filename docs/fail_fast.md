# Failing Fast

- In a configuration file `{ failFast: true }`
- On the CLI `cucumber-js --fail-fast`

By default, Cucumber runs the entire suite and reports all the failures. `failFast` allows a developer workflow where you work on one failure at a time. Combining this feature with rerun files allows you to work through all failures in an efficient manner.

A note on using in conjunction with [Retry](./retry.md): we consider a test case to have failed if it exhausts retries and still fails, but passed if it passes on a retry having failed previous attempts, so `failFast` does still allow retries to happen.
