# Thank you!

Before anything else, thank you. Thank you for taking some of your precious time helping this project move forward.

## Setup

* install [Node.Js](https://nodejs.org/en/) and [Yarn](https://yarnpkg.com/)
* `yarn install`

## Tests

See the `package.json` scripts section for how to run the tests.

* lint
  * [eslint](http://eslint.org/)
* unit tests
  * [mocha](https://mochajs.org/)
  * [chai](http://chaijs.com/)
  * [sinon](http://sinonjs.org/)
* feature tests
  * cucumber-js tests itself

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
    ├── runtime               # run features / scenarios / steps, trigger events
    │
    └── support_code_library  # load hooks / step definitions
```

The runtime triggers events similar to an [EventEmitter](https://nodejs.org/api/events.html#events_class_eventemitter)
but waits for the listener to finish (the same style used in hook and step definitions).

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
  * Ensure the example works `node scripts/server.js`, visit `localhost:9797` in your browser
    * For now, need to manually update Gherkin with this [change](https://github.com/cucumber/gherkin/commit/46e72cd3cd79965298a9b154af7741480230b916), until the next version is released

Review the changes, if everything looks good, squash merge into master.

* commit message should have the format "Release 0.1.2" (replacing *0.1.2* with the actual version)
* Tag commit as "v0.1.2"
* Publish to NPM
