# Rerun

*Note: if you want a mechanism to retry flaky scenarios when they fail in CI, take a look at [Retry](./retry.md) instead.*

If you're doing TDD, you might sometimes work like this:

1. Run all the tests to see what fails
2. Make changes to address failures
3. Run just the tests that failed
4. GOTO 2

Rerun makes this kind of workflow convenient, so you don't have to hand-craft command line arguments to run just the tests that failed on the previous run.

First, enable the `rerun` formatter every time you run cucumber-js:

- In a configuration file `{ format: ['rerun:@rerun.txt'] }`
- On the CLI `cucumber-js --format rerun:@rerun.txt`

You can do this via the CLI, or more likely via a [default profile](./profiles.md).

The output file doesn't have to be named `@rerun.txt`, but its name _does_ have to start with `@` - this is how cucumber-js will later distinguish it from feature files. Either way, you should add this file to your `.gitignore` so you don't accidentally commit it. 

Let's say we run cucumber-js for a Todo app we've made, and a few scenarios fail. Our rerun file's contents would look something like this:

```
features/adding.feature:3:19
features/editing.feature:8
```

If this notation looks familiar, it's the same as for specifying scenarios by line on the CLI, and translates to:

- In `adding.feature`, the scenarios on lines 3 and 19
- In `editing.feature`, the scenario on line 8

So, let's say we've looked at the failure on `editing.feature` and fixed our code. Now let's run cucumber-js again, but pointing at the rerun file:

```shell
cucumber-js @rerun.txt
```

cucumber-js will unpack this and just run those three failing scenarios accordingly. This time, it goes a bit better - our fix worked, and the rerun file now looks like this:

```
features/adding.feature:3:19
```

In other words, the one we fixed has passed and thus dropped off. We can repeat this cycle as many times as needed until eventually the rerun file will be empty because everything has passed. If you run cucumber-js pointing at an empty rerun file, no scenarios will be run.

## Separator

By default, entries in the rerun file are separated by newlines. This can be overwritten via a [format option](./formatters.md#options):

- In a configuration file `{ formatOptions: { rerun: { separator: '<separator>' } } }`
- On the CLI `cucumber-js --format-options '{"rerun": {"separator": "<separator>"}}'`

This is useful when one needs to rerun failed tests locally by copying a line from a CI log while using a space character as a separator. Note that the rerun file parser can only work with the default separator for now.
