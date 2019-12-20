Feature: custom formatter
  Background:
    Given a file named "features/a.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given an undefined step
      """

  Scenario: extending Formatter
    Given a file named "simple_formatter.js" with:
      """
      const { Formatter, formatterHelpers, Status } = require('cucumber')

      class SimpleFormatter extends Formatter {
        constructor(options) {
          super(options)
          options.eventBroadcaster.on('envelope', (envelope) => {
            if (envelope.testCaseFinished) {
              this.logTestCaseFinished(envelope.testCaseFinished)
            } else if (envelope.testRunFinished) {
              this.logTestRunFinished(envelope.testRunFinished)
            }
          })
        }

        logTestCaseFinished(testCaseFinished) {
          const testCaseAttempt = this.eventDataCollector.getTestCaseAttempt(testCaseFinished.testCaseStartedId)
          this.log(testCaseAttempt.gherkinDocument.feature.name + ' / ' + testCaseAttempt.pickle.name + '\n')
          const parsed = formatterHelpers.parseTestCaseAttempt({
            cwd: this.cwd,
            snippetBuilder: this.snippetBuilder, 
            supportCodeLibrary: this.supportCodeLibrary,
            testCaseAttempt 
          })
          parsed.testSteps.forEach(testStep => {
            this.log('  ' + testStep.keyword + (testStep.text || '') + ' - ' + Status[testStep.result.status] + '\n')
          })
          this.log('\n')
        }

        logTestRunFinished(testRunFinished) {
          this.log(testRunFinished.success ? 'SUCCESS' : 'FAILURE')
        }
      }

      module.exports = SimpleFormatter
      """
    When I run cucumber-js with `--format ./simple_formatter.js`
    Then it fails
    And it outputs the text:
      """
      a feature / a scenario
        Given an undefined step - UNDEFINED

      FAILURE
      """

  Scenario: extending SummaryFormatter
    Given a file named "features/a.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given an undefined step
      """
    And a file named "simple_formatter.js" with:
      """
      const { SummaryFormatter, formatterHelpers, Status } = require('cucumber')

      class SimpleFormatter extends SummaryFormatter {
        constructor(options) {
          super(options)
          options.eventBroadcaster.on('envelope', (envelope) => {
            if (envelope.testCaseFinished) {
              this.logTestCaseFinished(envelope.testCaseFinished)
            }
          })
        }

        logTestCaseFinished(testCaseFinished) {
          const testCaseAttempt = this.eventDataCollector.getTestCaseAttempt(testCaseFinished.testCaseStartedId)
          this.log(testCaseAttempt.gherkinDocument.feature.name + ' / ' + testCaseAttempt.pickle.name + '\n')
          const parsed = formatterHelpers.parseTestCaseAttempt({
            cwd: this.cwd,
            snippetBuilder: this.snippetBuilder, 
            supportCodeLibrary: this.supportCodeLibrary,
            testCaseAttempt 
          })
          parsed.testSteps.forEach(testStep => {
            this.log('  ' + testStep.keyword + (testStep.text || '') + ' - ' + Status[testStep.result.status] + '\n')
          })
          this.log('\n')
        }
      }

      module.exports = SimpleFormatter
      """
    When I run cucumber-js with `--format ./simple_formatter.js`
    Then it fails
    And it outputs the text:
      """
      a feature / a scenario
        Given an undefined step - UNDEFINED

      Failures:

      1) Scenario: a scenario # features/a.feature:2
         ? Given an undefined step
             Undefined. Implement with the following snippet:

               Given('an undefined step', function () {
                 // Write code here that turns the phrase above into concrete actions
                 return 'pending';
               });


      1 scenario (1 undefined)
      1 step (1 undefined)
      <duration-stat>
      """
