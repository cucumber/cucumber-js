# Parallel

Cucumber supports running scenarios in parallel. The main process becomes a "coordinator" and spins up several separate Node processes to be the "workers". You can enable this with the `--parallel <NUMBER_OF_WORKERS>` CLI option:

```shell
$ cucumber-js --parallel 3
```

The number you provide is the number of workers that will run scenarios in parallel.

Each worker receives the following env variables (as well as a copy of `process.env` from the coordinator process):

* `CUCUMBER_PARALLEL` - set to 'true'
* `CUCUMBER_TOTAL_WORKERS` - set to the number of workers
* `CUCUMBER_WORKER_ID` - ID for worker ('0', '1', '2', etc.)

### Timing

When using parallel mode, the last line of the summary output differentiates between real time elapsed during the test run and aggregate time spent actually running steps:

```
73 scenarios (73 passed)
512 steps (512 passed)
0m51.627s (executing steps: 4m51.228s)
```

### Hooks

When using parallel mode, any `BeforeAll` and `AfterAll` hooks you have defined will run _once per worker_.
