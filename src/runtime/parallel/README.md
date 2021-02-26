Parallelization is achieved by having multiple child processes running scenarios.

#### Customizable work assignment
Cucumber exposes customization of worker assignment via `setParallelCanAssign`.
The example below overrides the default, `() => true` which processes test cases 
indiscriminately, with a 1, 2 skip a few processing scheme. This means, the first
2 *remaining* steps will be executed then the 4th *remaining* step will be executed.

```typescript
import { setParallelCanAssign } from '@cucumber/cucumber'
const counter = 0;
setParallelCanAssign((pickleInQuestion, picklesInProgress) => counter++ % 5 < 1)
/** Processing order of: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
 * After   Worked | Waiting    
 * first 2 [0, 1] | [2, 3, 4, 5, 6, 7, 8, 9]
 * 4th     [0, 1, 5] | [2, 3, 4, 6, 7, 8, 9]
 * first 2 [0, 1, 5, 2, 3] | [4, 6, 7, 8, 9]
 * 4th     [0, 1, 5, 2, 3, 8] | [4, 6, 7, 9]
 * fisrt 2 [0, 1, 5, 2, 3, 8, 4, 6] | [7, 9]
 * 4th     [0, 1, 5, 2, 3, 8, 4, 6, 9] | [7]
 * first    [0, 1, 5, 2, 3, 8, 4, 6, 9, 7]
 */ 
```

As you can see, the coordinator always returns to the beginning of the list when 
assigning work. Therefore, on assignment 3 `[2, 3, 4]` will be skipped, but the 
next assignment will check test case `2` as it is the first unworked test case in 
the list.

It is also important to note that this processing scheme could potentially result in 
all workers becoming idle. However, Cucumber prevents this by assigning work regardless 
of the custom handler if no work is in progress. This example is purely explanatory as 
there is no benefit to randomly skipping tests. Workers become idle after checking all 
remaining test cases against the handler. Assignment is attempted on all idle workers 
when a busy worker becomes `ready`.

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
