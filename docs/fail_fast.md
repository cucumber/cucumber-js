# Failing Fast

- In a configuration file `{ failFast: true }`
- On the CLI `cucumber-js --fail-fast`

By default, Cucumber runs the entire suite and reports all the failures. `failFast` allows a developer workflow where you work on one failure at a time. Combining this feature with rerun files allows you to work through all failures in an efficient manner.

A note on using in conjunction with [Retry](./retry.md): we consider a test case to have failed if it exhausts retries and still fails, but passed if it passes on a retry having failed previous attempts, so `failFast` does still allow retries to happen.

## Maximum failures

- In a configuration file `{ maxFailures: 10 }`
- On the CLI `cucumber-js --max-failures 10`

`failFast` is useful when working through failures one at a time, but too strict for a CI run where an occasional failure is expected. `maxFailures` lets the run carry on through the first few failures, but stops it once the given number of test cases have failed. That way, something systemic like a broken build or an unavailable service doesn't spend the whole run failing the same way again and again.

Once the limit is reached, test cases that are already running (when running in [parallel](./parallel.md)) will finish, and the rest will be reported as skipped. Failures are counted the same way as for `failFast`, so a test case that passes on a retry doesn't count towards the limit.

The default of `0` means no limit. `failFast` is equivalent to `maxFailures: 1`; if both are set, the lower limit applies.
