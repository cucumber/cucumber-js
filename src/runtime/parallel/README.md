Parallelization is achieved by having multiple child processes running scenarios.

#### Master
- load all features, generate test cases
- broadcast `test-run-started`
- create workers and for each worker
  - send an `initialize` command
  - when a worker outputs a `ready` command, send it a `run` command with a test case. If there are no more test cases, send a `finalize` command
  - when a worker outputs an `event` command,
    broadcast the event to the formatters,
    and on `test-case-finished` update the overall result
- when all workers have exited, broadcast `test-run-finished`

#### Slave
- when receiving the `initialize` command
  - load the support code and runs `BeforeAll` hooks
  - output the `ready` command
- when receiving a `run` command
  - run the given testCase, outputting `event` commands
  - output the `ready` command
- when receiving the `finalize` command
  - run the `AfterAll` hooks
  - exit
