# Parallel

Cucumber supports running scenarios in parallel. The main process becomes a "coordinator" and spins up several separate Node.js processes to be the "workers". You can enable this with the `parallel` configuration option:

- In a configuration file `{ parallel: 3 }`
- On the CLI `cucumber-js --parallel 3`

The number you provide is the number of workers that will run scenarios in parallel.

Each worker receives the following env variables (as well as a copy of `process.env` from the coordinator process):

- `CUCUMBER_PARALLEL` - set to 'true'
- `CUCUMBER_TOTAL_WORKERS` - set to the number of workers
- `CUCUMBER_WORKER_ID` - ID for worker ('0', '1', '2', etc.)

### Timing

When using parallel mode, the last line of the summary output differentiates between real time elapsed during the test run and aggregate time spent actually running steps:

```
73 scenarios (73 passed)
512 steps (512 passed)
0m51.627s (executing steps: 4m51.228s)
```

### Hooks

When using parallel mode, any `BeforeAll` and `AfterAll` hooks you have defined will run _once per worker_.

### Custom work assignment

If you would like to prevent specific sets of scenarios from running in parallel you can use `setParallelCanAssign`.

Example:

```javascript
setParallelCanAssign(function (pickleInQuestion, picklesInProgress) {
  // Only one pickle with the word example in the name can run at a time
  if (pickleInQuestion.name.includes('example')) {
    return picklesInProgress.every((p) => !p.name.includes('example'))
  }
  // No other restrictions
  return true
})
```

For convenience, the following helpers exist to build a `canAssignFn`:

```javascript
import {
  setParallelCanAssign,
  parallelCanAssignHelpers,
} from '@cucumber/cucumber'

const { atMostOnePicklePerTag } = parallelCanAssignHelpers
const myTagRule = atMostOnePicklePerTag(['@tag1', '@tag2'])

// Only one pickle with @tag1 can run at a time
//   AND only one pickle with @tag2 can run at a time
setParallelCanAssign(myTagRule)

// If you want to join a tag rule with other rules you can compose them like so:
const myCustomRule = function (pickleInQuestion, picklesInProgress) {
  // ...
}

setParallelCanAssign(function (pickleInQuestion, picklesInProgress) {
  return (
    myCustomRule(pickleInQuestion, picklesInProgress) &&
    myTagRule(pickleInQuestion, picklesInProgress)
  )
})
```

### Formatting

You can access `workerId` property in `testCaseStarted` envelope object:

```javascript
const { Formatter } = require('@cucumber/cucumber')

class ExampleFormatter extends Formatter {
  constructor(options) {
    options.eventBroadcaster.on('envelope', (envelope) => {
      if (envelope.testCaseStarted) {
        if (envelope.testCaseStarted.workerId) {
          console.log(
            `the event has been fired from a worker with id ${envelope.testCaseStarted.workerId}`
          )
        } else {
          console.log('the event has been sent from the main thread')
        }
      }
    })

    super(options)
  }
}

module.exports = ExampleFormatter
```
