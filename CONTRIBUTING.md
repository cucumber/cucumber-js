# Thank you!

Before anything else, thank you. Thank you for taking some of your precious time helping this project move forward.

## Setup

* install [Node.Js](https://nodejs.org/en/) and [Yarn](https://yarnpkg.com/)
* `yarn install`

## Tests

See the `package.json` scripts section for how to run each category of tests.

* lint - `yarn lint`
  * [prettier](https://github.com/prettier/prettier)
  * [eslint](https://eslint.org/)
  * [dependency-lint](https://github.com/charlierudolph/dependency-lint)
* typescript tests - `yarn types-test`
  * [tsd](https://github.com/SamVerschueren/tsd)
* unit tests - `yarn unit-test`
  * [mocha](https://mochajs.org/)
  * [chai](https://www.chaijs.com/)
  * [sinon](https://sinonjs.org/)
* compatibility kit - `yarn cck-test`
  * checking that cucumber-js emits the [correct messages](https://github.com/cucumber/cucumber/tree/master/compatibility-kit) 
* feature tests - `yarn feature-test`
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
    ├── runtime               # run test cases, emits the event protocol
    │
    └── support_code_library  # load hooks / step definitions
```

The runtime emits events with an [EventEmitter](https://nodejs.org/api/events.html#events_class_eventemitter)

### Coding style

* Promises and ES7 async/await
* Try to make things as unit testable as possible. If it's hard to unit test, the class/function may be doing too much.

## Changelog

* Every PR should have a changelog entry
* The contributor should update the changelog
* Each entry in the changelog should include a link to the relevant issues/PRs

## Release process

_The following is a checklist for maintainers when preparing a new release_

### Major releases

We will always make a release candidate before issuing a major release. The release candidate will be available for at least a month to give users
time to validate that there are no unexpected breaking changes.

### Process

The release is done from the [cucumber-build](https://github.com/cucumber/cucumber-build/) docker container. This makes
sure we use the same environment for all releases.

**Every command should be run from within the Docker container**.

Start the container:

    make docker-run

Inside the container, install the correct versions of Node and Yarn:

    nvm install --lts
    npm install -g yarn

Then update the dependencies and test:

    yarn update-dependencies
    yarn
    yarn test

If the tests fail, update your code to be compatible with the new libraries, or revert the library upgrades that break the build.

* Add missing entries to `CHANGELOG.md`
  * Ideally the CHANGELOG should be up-to-date, but sometimes there will be accidental omissions when merging PRs. Missing PRs should be added.
  * Describe the major changes introduced. API changes must be documented. In particular, backward-incompatible changes must be well explained, with examples when possible.
  * `git log --format=format:"* %s (%an)" --reverse <last-version-tag>..HEAD` might be handy.
* Update the contributors list in `package.json`
  * `git log --format=format:"%an <%ae>" --reverse <last-version-tag>..HEAD  | grep -vEi "(renovate|dependabot|Snyk)" | sort| uniq -i`
  * Manually add contributors (in alphabetical order)

[Decide what the next version should be](https://github.com/cucumber/cucumber/blob/master/RELEASE_PROCESS.md#decide-what-the-next-version-should-be).

Update CHANGELOG links:

    NEW_VERSION=<major.minor.patch(-rc.X)> make update-changelog

Verify changes to the CHANGELOG are correct. Stage uncommitted changes:

    git add .
    git commit -am "Release <major.minor.patch(-rc.X)>"

Then bump the version number and create a git tag. Run *one* of the following:

    # Major prelease
    npm version premajor --preid=rc

    # Major release
    npm version major

    # Minor release
    npm version minor

    # Patch release
    npm version patch

Publish to npm:

    npm publish --access public

Push to git:

    git push
    git push --tags

* Update [docs.cucumber.io](https://github.com/cucumber/docs.cucumber.io)
  * Update the cucumber-js version `data/versions.yaml`
  * Ensure the javascript examples are up to date
