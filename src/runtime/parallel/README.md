Parallelization is achieved by having multiple child processes running scenarios.

#### Customizable work assignment
Cucumber exposes customization of worker assignment via `setParallelCanAssign`.
The example below overrides the default, `() => true` which processes test cases 
indiscriminately, with a 1, 2 skip a few processing scheme. This means, the first
2 *remaining* steps will be executed then the 4th *remaining* step will be executed.
Considering 10 test cases `[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]` they will be processed
in the following order `[0, 1, 5, 2, 3, 8, 4, 6, 9, 7]`.

Though test cases are skipped, they still appear sooner than you may have expected.
this is because the coordinator always returns to the begning of the list when 
assigning work. Therefore, on assignment 3 `[2, 3, 4]` will be skipped, but the 
next assignment will check test case `2` as it is the first unworked test case in 
the list.

It is also important to note that this processing scheme will potentially result in 
all workers becoming idle, with 2 cases left, and failing the run. This example is 
purely explanatory as there is no benefit to doing this. Workers become idle after
checking all remaining test cases against the function passed to `setParallelCanAssign`.
Assignment is attempted on all idle workers when a busy worker becomes `ready`.
```typescript
import { setParallelCanAssign } from '@cucumber/cucumber'
const counter = 0;
setParallelCanAssign((pickleInQuestion, picklesInProgress) => counter++ % 5 < 1)
```

#### Coordinator
- load all features, generate test cases
- broadcast `test-run-started`
- create workers and for each worker
  - send an `initialize` command
  - when a worker outputs a `ready` command
    - If there are no more test cases, send a `finalize` command
    - Identify the next processable test case (the next test by default)
    - when there are no processable test cases all idle workers remain idle
    - send a `run` command with the test case to an idle worker 
    - repeat if there are still idle workers
  - if all workers become idle then exit in failure
  - when a worker outputs an `event` command,
    broadcast the event to the formatters,
    and on `test-case-finished` update the overall result
- when all workers have exited, broadcast `test-run-finished`

#### Worker
- when receiving the `initialize` command
  - load the support code and runs `BeforeAll` hooks
  - output the `ready` command
- when receiving a `run` command
  - run the given testCase, outputting `event` commands
  - output the `ready` command
- when receiving the `finalize` command
  - run the `AfterAll` hooks
  - exit
