Parallelization is achieved by having multiple child processes running scenarios.

#### Customizable work assignment
Cucumber exposes customization of worker assignment via `setParallelCanAssign`.
This can be used to prevent specific test cases from running at the same time.

The coordinator doesn't reorder work as it skips un-assignable tests. Also, it always
returns to the beginning of the unprocessed list when attempting to make assignments
to an idle worker.

Custom work assignment prioritizes your definition of assignable work over efficiency.
The exception to this rule is if all remaining work is un-assignable, such that all
workers are idle. In this case Cucumber assigns the next test to the first worker
before continuing to utilize the handler to determine assignable work. Workers become
idle after checking all remaining test cases against the handler. Assignment is
attempted on all idle workers when a busy worker becomes `ready`.

#### Coordinator
- load all features, generate test cases
- broadcast `test-run-started`
- create workers and for each worker
  - send an `initialize` command
  - when a worker outputs a `ready` command
    - if there are no more test cases, send a `finalize` command
    - identify the next processable test case (the next test by default)
    - when there are no processable test cases all idle workers remain idle
    - send a `run` command with the test case to an idle worker
    - repeat if there are still idle workers
  - if all workers become idle and there are more tests, process the next test case
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
