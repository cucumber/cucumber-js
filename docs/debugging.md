# Debugging

If things aren't working the way you expect with Cucumber, you can enable debug logging. When this is enabled, Cucumber will emit logging to `stderr` relating to configuration and other things that can help you pin down a problem with your project.

Cucumber uses the [popular `debug` library](https://www.npmjs.com/package/debug) to detect when debug logging should be enabled, under the `cucumber` scope. To enable debug logging, set the `DEBUG` environment variable, like:

```shell
DEBUG=cucumber
```
