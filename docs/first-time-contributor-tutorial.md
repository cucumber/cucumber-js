This tutorial aims to guide a new contributor into fixing the issue #1136

PR #1721 has been opened with a new scenario which validate the behavior we
would like to implement.

That scenario can be found here: [features/error_formatting.feature#L110](features/error_formatting.feature#L110)

# Addition of unit test

A new scenario has been added, but we still can add some unit tests to have a
better focus on the pieces of code to modify.

The first phrase of the issue #1136 references an older PR #1041. That PR has
modified the code in `src/formatter/helpers/issue_helpers.js` and the
corresponding `src/formatter/helpers/issue_helpers_spec.js`. Without digging
deeper in those files and in the PR #1041, if we just take a look at
`issue_helpers_spec.js` - which is actually now a Typescript file
[issue_helpers_spec.ts](src/formatter/helpers/issue_helpers_spec.ts) - we can
see some tests that seems to be related to our issue.

So, let's move at the last `describe` section of `issue_helpers_spec.ts`, and
make it looks like the following:

```typescript
// src/formatter/helpers/issue_helpers_spec.ts

    describe('step with attachment text', () => {
      it('prints the scenario', async () => {
        // here's the content of the "prints the scenario" test
      })

      describe('when it is requested to not print attachments', () => {
        it('does not output attachment', async () => {
          // Arrange
          const sourceData = reindent(`
            Feature: my feature
              Scenario: my scenario
                Given attachment step1
                When attachment step2
                Then a passing step
          `)

          // Act
          const output = await testFormatIssue(sourceData)

          // Assert
          expect(output).to.eql(
            reindent(`
              1) Scenario: my scenario # a.feature:2
                 ${figures.tick} Given attachment step1 # steps.ts:35
                 ${figures.cross} When attachment step2 # steps.ts:41
                     error
                 - Then a passing step # steps.ts:29


            `)
          )
        })
      })
    })
```

We notice here that `it('does not output attachment')` looks a lot like
`it('prints the scenario')`. One difference is that the expected output does not
print any info regarding the attachments anymore.

Now execute the unit tests:

    yarn run unit-test

As expected, our new test is failing. Now let's add a new parameter to
`testFormatIssue`:

Line 10 of `issue_helpers_spec.ts`, add a new `printAttachments` parameter to
`testFormatIssue` with a default value to `true` to avoid breaking things
outside of our new test:

```typescript
async function testFormatIssue(sourceData: string, printAttachments = true): Promise<string> {
```

In our new test, we can call `testFormatIssue` with `printAttachments` parameter
set to `false`:

```typescript
// src/formatter/helpers/issue_helpers_spec.ts

        it('does not output attachment', async () => {
          // Arrange
          const sourceData = reindent(`
            Feature: my feature
              Scenario: my scenario
                Given attachment step1
                When attachment step2
                Then a passing step
          `)

          // Act
          const output = await testFormatIssue(sourceData, false)

          // Assert
          expect(output).to.eql(
            reindent(`
              1) Scenario: my scenario # a.feature:2
                 ${figures.tick} Given attachment step1 # steps.ts:35
                 ${figures.cross} When attachment step2 # steps.ts:41
                     error
                 - Then a passing step # steps.ts:29


            `)
          )
        })
```

Our test is still failing - that is expected - but we have some tests now.

# Fixing the code

Still in `issue_helpers_spec.ts`, if we look at `testFormatIssue`, we can see
that it calls a `formatIssue` method which is imported from `issues_helper.ts`.

Open `issue_helper.ts` and look at the `formatIssue` method. It lead us into
a method named `formatTestCaseAttempt` which is defined in
`test_case_attempt_formatter.ts`. One step further and we find that `formatStep`
method, still in `test_case_attempt_formatter.ts`, which seems responsible for
actually adding the attachments to the output. So, let's give it a try: change
the `formatStep` method like the following:

```typescript
// src/formatter/helpers/test_case_attempt_formatter.ts

interface IFormatStepRequest {
  colorFns: IColorFns
  testStep: IParsedTestStep
  printAttachments?: boolean
}

function formatStep({
  colorFns,
  testStep,
  printAttachments,
}: IFormatStepRequest): string {
```

Here we have added a `printAttachments` parameter. This parameter is optional
in order to avoid breaking things. Now look for the block which process the
attachments, and make sure to execute it only if `printAttachments` is not
explicitly false:

```typescript
// src/formatter/helpers/test_case_attempt_formatter.ts#formatStep

  if (valueOrDefault(printAttachments, true)) {
    attachments.forEach(({ body, mediaType }) => {
      const message = mediaType === 'text/plain' ? `: ${body}` : ''
      text += indentString(`Attachment (${mediaType})${message}\n`, 4)
    })
  }
```

Now we have to make sure that the value we pass to `testFormatIssue` is
transmitted to `formatStep`. That means updating `formatTestCaseAttempt`:
```typescript
// src/formatter/helpers/test_case_attempt_formatter.ts

export interface IFormatTestCaseAttemptRequest {
  colorFns: IColorFns
  cwd: string
  testCaseAttempt: ITestCaseAttempt
  snippetBuilder: StepDefinitionSnippetBuilder
  supportCodeLibrary: ISupportCodeLibrary
  printAttachments?: boolean
}

export function formatTestCaseAttempt({
  colorFns,
  cwd,
  snippetBuilder,
  supportCodeLibrary,
  testCaseAttempt,
  printAttachments,
}: IFormatTestCaseAttemptRequest): string {

  // locate the call to formatStep to add the argument:

  text += formatStep({ colorFns, testStep, printAttachments })
```

and `formatIssue` in `issue_helpers.ts`:

```typescript
// src/formatter/helpers/issue_helpers.ts

export interface IFormatIssueRequest {
  colorFns: IColorFns
  cwd: string
  number: number
  snippetBuilder: StepDefinitionSnippetBuilder
  testCaseAttempt: ITestCaseAttempt
  supportCodeLibrary: ISupportCodeLibrary
  printAttachments?: boolean
}

export function formatIssue({
  colorFns,
  cwd,
  number,
  snippetBuilder,
  testCaseAttempt,
  supportCodeLibrary,
  printAttachments,
}: IFormatIssueRequest): string {

  // lcoate the call to formatTestCaseAttempt to add the argument:

  const formattedTestCaseAttempt = formatTestCaseAttempt({
    colorFns,
    cwd,
    snippetBuilder,
    testCaseAttempt,
    supportCodeLibrary,
    printAttachments,
  })

```

And, finally, in `issue_helpers_spec.ts`, within `testFormatIssue`:
```typescript
// src/formatter/helpers/issue_helpers_spec.ts

  return formatIssue({
    cwd: 'project/',
    colorFns: getColorFns(false),
    number: 1,
    snippetBuilder: FormatterBuilder.getStepDefinitionSnippetBuilder({
      cwd: 'project/',
      supportCodeLibrary,
    }),
    supportCodeLibrary,
    testCaseAttempt,
    printAttachments,
  })
```

Now, all unit tests should pass:

    yarn run unit-test

But, as expected, our acceptance test is still failing because we did not yet
managed the cli options:

    yarn run feature-test

# Make the feature test to pass

Our formatter has been fixed. Now it is time to add the option to the CLI.

If we look for `formatOptions` in the code base, we find `src/cli/argv_parser.ts`
which looks like a good candidate. It describes the interfaces for the CLI options.

We can easily spot the `IParsedArgvFormatOptions` interface which describe the options
available for `--format-options`. Let's add our `printAttachments` here:

```typescript
// src/cli/argv_parser.ts

export interface IParsedArgvFormatOptions {
  colorsEnabled?: boolean
  rerun?: IParsedArgvFormatRerunOptions
  snippetInterface?: SnippetInterface
  snippetSyntax?: string
  printAttachments?: boolean
  [customKey: string]: any
}
```

Next step: adding this option to our formatters.

All formatters extends the `Formatter` base class, so let's add the option there:

```typescript
// src/formatter/index.ts

// some imports
import { valueOrDefault } from '../value_checker'

// ...

export default class Formatter {
  protected colorFns: IColorFns
  protected cwd: string
  protected eventDataCollector: EventDataCollector
  protected log: IFormatterLogFn
  protected snippetBuilder: StepDefinitionSnippetBuilder
  protected stream: WritableStream
  protected supportCodeLibrary: ISupportCodeLibrary
  protected printAttachments: boolean
  private readonly cleanup: IFormatterCleanupFn

  constructor(options: IFormatterOptions) {
    this.colorFns = options.colorFns
    this.cwd = options.cwd
    this.eventDataCollector = options.eventDataCollector
    this.log = options.log
    this.snippetBuilder = options.snippetBuilder
    this.stream = options.stream
    this.supportCodeLibrary = options.supportCodeLibrary
    this.cleanup = options.cleanup
    this.printAttachments = valueOrDefault(
      options.parsedArgvOptions.printAttachments,
      true
    )
  }
```

We have added the option `printAttachments` to the formatter members. We make sure
it is `true` per default using the `valueOrDefault` function. Otherwise, if the option
is not specified, it would have been falsy per default.

Finally, we have to make sure we call the `formatIssue` method with the value of
`printAttachments`.

A global search for `formatIssue` find two usage for it: in `progress_bar_formatter.ts`
and in `summary_formatter.ts`. Let's update those two files:

```typescript
// src/formatter/progress_bar_formatter.ts

// Locate the call to formatIssue

      this.progressBar.interrupt(
        formatIssue({
          colorFns: this.colorFns,
          cwd: this.cwd,
          number: this.issueCount,
          snippetBuilder: this.snippetBuilder,
          supportCodeLibrary: this.supportCodeLibrary,
          testCaseAttempt,
          printAttachments: this.printAttachments,
        })
      )
```

```typescript
// src/formatter/summary_formatter.ts

// Locate the call to formatIssue

  logIssues({ issues, title }: ILogIssuesRequest): void {
    this.log(`${title}:\n\n`)
    issues.forEach((testCaseAttempt, index) => {
      this.log(
        formatIssue({
          colorFns: this.colorFns,
          cwd: this.cwd,
          number: index + 1,
          snippetBuilder: this.snippetBuilder,
          supportCodeLibrary: this.supportCodeLibrary,
          testCaseAttempt,
          printAttachments: this.printAttachments,
        })
      )
    })
  }
```

So, it should be working now

    yarn run feature-test

# Finalizing the Pull Request

Last but not least, let's make sure the PR is valid.

First, execute all the tests:

    yarn test

You may have some linting issues here. Fix those and retry until everything pass.

We also need to add some documentation in `docs/cli.md`. Add the following between
the `## Parallel` and the `## Profiles` sections:

```markdown

## Printing Attachments Details

Printing attachments details can be disabled with
`--fomat-options '{"printAttachmants": false}'`.

This option applies to the progress formatter and the summary formatter.

```

Now we should add an entry in the CHANGELOG.md. Open it, locate the `### Added` section
for the unreleased changes, and add something about the changes we just did:

```markdown

* Add a new option to `--format-option`: `printAttachments`.
  See [./docs/cli.md#printing-attachments-details](https://github.com/cucumber/cucumber-js/blob/main/docs/cli.md#printing-attachments-details) for more info.
  ([#1136](https://github.com/cucumber/cucumber-js/issues/1136)
  [#1721](https://github.com/cucumber/cucumber-js/pull/1721))

```

That's it! You can now set your PR as ready for review!