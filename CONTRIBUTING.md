# Thank you!

Before anything else, thank you. Thank you for taking some of your precious time helping this project move forward.

## Setup

* install [Node.Js](https://nodejs.org/en/) and [Yarn](https://yarnpkg.com/)
* `yarn install`

## Tests

See the `package.json` scripts section for how to run the tests.

* lint
  * [prettier](https://github.com/prettier/prettier)
  * [eslint](http://eslint.org/)
  * [dependency-lint](https://github.com/charlierudolph/dependency-lint)
* unit tests
  * [mocha](https://mochajs.org/)
  * [chai](http://chaijs.com/)
  * [sinon](http://sinonjs.org/)
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

## Release process

_The following is a checklist for maintainers when preparing a new release_

Perform the following steps on a feature branch.

* Update `CHANGELOG.md`
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
