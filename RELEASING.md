# Releasing

First, update as many dependencies as you can and test:

    npm run update-dependencies
    npm test

If the tests fail, update your code to be compatible with the new libraries, or
revert the library upgrades that break the build.

* Add missing entries to `CHANGELOG.md`
  * Ideally the CHANGELOG should be up-to-date, but sometimes there will be accidental omissions when merging PRs. Missing PRs should be added.
  * Describe the major changes introduced. API changes must be documented. In particular, backward-incompatible changes must be well explained, with examples when possible.
  * `git log --format=format:"* %s (%an)" --reverse <last-version-tag>..HEAD` might be handy.
* Update the contributors list in `package.json`
  * `git log --format=format:"%an <%ae>" --reverse <last-version-tag>..HEAD  | grep -vEi "(renovate|dependabot|Snyk)" | sort| uniq -i`
  * Manually add contributors (in alphabetical order)

Follow [cucumber/.github/RELEASING.md](https://github.com/cucumber/.github/blob/main/RELEASING.md)
for the rest of the release process.
