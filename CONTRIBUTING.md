# Thank you!

Before anything else, thank you. Thank you for taking some of your precious time helping this project move forward.

## Setup

* install [Node.Js](https://nodejs.org/en/) and [Yarn](https://yarnpkg.com/)
* `yarn install`

## Tests

See the `package.json` scripts section for how to run the tests.

* lint
  * [prettier](https://github.com/prettier/prettier)
  * [eslint](https://eslint.org/)
  * [dependency-lint](https://github.com/charlierudolph/dependency-lint)
* unit tests
  * [mocha](https://mochajs.org/)
  * [chai](https://www.chaijs.com/)
  * [sinon](https://sinonjs.org/)
* feature tests
  * cucumber-js tests itself

## Test browser example locally

* Run `yarn build-browser-example`
* Run `node scripts/server.js`
* Visit `localhost:9797`.

The published browser example is only updated when releasing a new version.

## Internals

### Project Structure

```
└── src
    │
    ├── cli                   # argv parsing, reading files
    │
    ├── formatter             # displaying the results
    │
    ├── models                # data structures
    │
    ├── runtime               # run test cases, emits the event protocol
    │
    └── support_code_library  # load hooks / step definitions
```

The runtime emits events with an [EventEmitter](https://nodejs.org/api/events.html#events_class_eventemitter)

### Coding style

* Promises and ES7 async/await
* Try to make things as unit testable as possible. If its hard to unit test, the class/function may be doing too much.

## Changelog

* Every PR should have a changelog entry
* The contributor should update the changelog
* Each entry in the changelog should include a link to the relevant issues/PRs

## Release process

_The following is a checklist for maintainers when preparing a new release_

### Major releases

We will always make a release candidate before issuing a major release. The release candidate will be available for at least a month to give users 
time to validate that there are no unexpected breaking changes.

TODO: document npm --preid option if necessary.

### Process

Perform the following steps on a feature branch called `release-v${version}` 
e.g. `release-v7.0.0` or `release-v7.0.0-rc.0`.

* Update `CHANGELOG.md`
  * Ideally the CHANGELOG should be up-to-date, but sometimes there will be accidental omissions when merging PRs. Missing PRs should be added.
  * Describe the major changes introduced. API changes must be documented. In particular, backward-incompatible changes must be well explained, with examples when possible.
  * `git log --format=format:"* %s (%an)" --reverse <last-version-tag>..HEAD` might be handy.
* Update `package.json`
  * bump version
  * add new contributors, if any
    * `git log --format=format:"%an <%ae>" --reverse <last-version-tag>..HEAD`
* Compile the bundle with `yarn run build-release`
  * Ensure the browser example works

Review the changes, if everything looks good, squash merge into master.

* commit message should have the format "Release 0.1.2" (replacing *0.1.2* with the actual version)
* Tag commit as "v0.1.2"
* CI will publish to NPM
* Update [docs.cucumber.io](https://github.com/cucumber/docs.cucumber.io)
  * Update the cucumber-js version `data/versions.yaml`
  * Ensure the javascript examples are up to date
