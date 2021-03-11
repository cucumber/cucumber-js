Parallelization is achieved by having multiple child processes running scenarios.

#### Customizable work assignment
Cucumber exposes customization of worker assignment via `setParallelCanAssign`.
The example below overrides the default, `() => true` which processes test cases 
indiscriminately, with a scheme that accepts untagged test cases as well as test cases
where the first tag doesn't match the first tag of any in progress tests.

```typescript
import { setParallelCanAssign } from '@cucumber/cucumber'
// Accept tests missing tags or no test is running having the same first tag
setParallelCanAssign((pickleInQuestion, picklesInProgress) => _.isEmpty(pickleInQuestion.tags) 
    || _.every(picklesInProgress, ({tags}) => _.isEmpty(tags) || tags[0].name !== pickleInQuestion.tags[0].name))
```
* Example using the handler above
* 2 workers, `A` and `B`
* Scenarios tagged as `@simple` (2 secs) or `@complex` (3 secs)
* The first tag of the scenarios: `[@complex, @complex, @complex, @simple, @simple, @simple]`

| Time | WIP | Events |
|---|---|---|
| 0 |  | assigned `1 (@complex)` to `worker A` | 
| 0 | `@complex` | skip `2 & 3 (@complex)` - assign `4 (@simple)` to `worker B` |
| 2 | `@complex` | skip `2 & 3 (@complex)` - assign `5 (@simple)` to `worker B` |
| 3 | `@simple` | assign `2 (@complex)` to `worker A` |
| 4 | `@complex` | skip `3 (@complex)` - assign `6 (@simple)` to `worker B` |
| 6 |  | assign `3 (@complex)` to `worker A` |
| 9 |  | done |
 

#### Note
The coordinator doesn't reorder work as it skips un-assignable tests. Also, it always
returns to the beginning of the unprocessed list when attempting to make assignments
to an idle worker. If there was a worker C in the example above, assignment to worker B
would skip 2 & 3 as shown; then assignment to worker C would also skip 2 & 3 upon
checking the test cases against the handler to determine if they have become assignable.

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
