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
      import {Formatter, formatterHelpers} from 'cucumber'

      class SimpleFormatter extends Formatter {
        constructor(options) {
          super(options)
          options.eventBroadcaster
            .on('test-case-finished', ::this.logTestCase)
            .on('test-run-finished', ::this.logTestRunResult)
        }

        logTestCase(testCaseFinishedEvent) {
          const collatedEvent = this.eventDataCollector.getCollatedEvent(testCaseFinishedEvent)
          this.log(collatedEvent.gherkinDocument.feature.name + ' / ' + collatedEvent.pickle.name + '\n')
          const parsed = formatterHelpers.parseCollatedEvent({ collatedEvent, snippetBuilder: this.snippetBuilder })
          parsed.testSteps.forEach(testStep => {
            this.log('  ' + testStep.keyword + (testStep.text || '') + ' - ' + testStep.result.status + '\n')
          })
          this.log('\n')
        }

        logTestRunResult({result}) {
          this.log(result.success ? 'SUCCESS' : 'FAILURE')
        }
      }

      module.exports = SimpleFormatter
      """
    When I run cucumber-js with `--format ./simple_formatter.js`
    Then it fails
    And it outputs the text:
      """
      a feature / a scenario
        Given an undefined step - undefined

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
      import {SummaryFormatter, formatterHelpers} from 'cucumber'

      class SimpleFormatter extends SummaryFormatter {
        constructor(options) {
          super(options)
          options.eventBroadcaster
            .on('test-case-finished', ::this.logTestCase)
        }

        logTestCase(testCaseFinishedEvent) {
          const collatedEvent = this.eventDataCollector.getCollatedEvent(testCaseFinishedEvent)
          this.log(collatedEvent.gherkinDocument.feature.name + ' / ' + collatedEvent.pickle.name + '\n')
          const parsed = formatterHelpers.parseCollatedEvent({ collatedEvent, snippetBuilder: this.snippetBuilder })
          parsed.testSteps.forEach(testStep => {
            this.log('  ' + testStep.keyword + (testStep.text || '') + ' - ' + testStep.result.status + '\n')
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
        Given an undefined step - undefined

      Warnings:

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
