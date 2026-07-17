# Publishing reports

You can publish a report of your test run to [Cucumber Reports](https://reports.cucumber.io/), a free service for viewing and sharing results. Enable it with the `publish` configuration option:

- In a configuration file `{ publish: true }`
- On the CLI `cucumber-js --publish`
- Environment variable `CUCUMBER_PUBLISH_ENABLED=true`

At the end of the run, the URL where your report is available is printed to the terminal.

Reports are anonymous and self-destruct after 24 hours unless claimed.

## Publishing privately

If you have an private/internal service that follows the Cucumber Reports API, you can point to that with environment variables:

| Variable                   | Description                                                                                    |
|----------------------------|------------------------------------------------------------------------------------------------|
| `CUCUMBER_PUBLISH_URL`     | Base URL of the reports service to publish to                                                  |
| `CUCUMBER_PUBLISH_TOKEN`   | Authentication token, will be added as a Bearer token in the `Authorizaton` header if supplied |

## Publishing behind a proxy

If your network requires outbound HTTP(S) requests to go via a proxy, set the standard proxy environment variables, plus [`NODE_USE_ENV_PROXY`](https://nodejs.org/api/cli.html#node_use_env_proxy1), which is what tells Node.js to honour them:

```shell
NODE_USE_ENV_PROXY=1 HTTPS_PROXY=http://proxy.example.com:3128 npx cucumber-js --publish
```

Some notes on this:

- `NODE_USE_ENV_PROXY` is a Node option rather than a cucumber-js one, and applies to the whole process. You can also enable it with `NODE_OPTIONS="--use-env-proxy"`, or the `--use-env-proxy` flag if you're invoking `node` directly.
- It requires Node.js 22.21.0 or 24.0.0 and above.
- `HTTPS_PROXY` covers requests to Cucumber Reports itself; `HTTP_PROXY` is only relevant if you've pointed `CUCUMBER_PUBLISH_URL` at a plain HTTP service.
- `NO_PROXY` is honoured, so you can bypass the proxy for specific hosts.
- Credentials in the proxy URL (e.g. `http://user:pass@proxy.example.com:3128`) are supported.
