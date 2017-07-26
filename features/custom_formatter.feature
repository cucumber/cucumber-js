@node-6
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
      import {Formatter} from 'cucumber'

      class SimpleFormatter extends Formatter {
        constructor(options) {
          super(options)
          options.eventBroadcaster
            .on('test-case-started', ::this.logTestCaseName)
            .on('test-step-finished', ::this.logTestStep)
            .on('test-case-finished', ::this.logSeparator)
            .on('test-run-finished', ::this.logTestRunResult)
        }

        logTestCaseName({sourceLocation}) {
          const {gherkinDocument, pickle} = this.eventDataCollector.getTestCaseData(sourceLocation)
          this.log(gherkinDocument.feature.name + ' / ' + pickle.name + '\n');
        }

        logTestStep({testCase, index, result}) {
          const {gherkinKeyword, pickleStep, testStep} = this.eventDataCollector.getTestStepData({testCase, index})
          if (pickleStep) {
            this.log('  ' + gherkinKeyword + pickleStep.text + ' - ' + result.status + '\n');
          } else {
            this.log('  Hook - ' + result.status + '\n');
          }
        }

        logSeparator() {
          this.log('\n');
        }

        logTestRunResult({result}) {
          this.log(result.success ? 'SUCCESS' : 'FAILURE');
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
      import {SummaryFormatter} from 'cucumber'

      class SimpleFormatter extends SummaryFormatter {
        constructor(options) {
          super(options)
          options.eventBroadcaster
            .on('test-case-started', ::this.logTestCaseName)
            .on('test-step-finished', ::this.logTestStep)
            .on('test-case-finished', ::this.logSeparator)
        }

        logTestCaseName({sourceLocation}) {
          const {gherkinDocument, pickle} = this.eventDataCollector.getTestCaseData(sourceLocation)
          this.log(gherkinDocument.feature.name + ' / ' + pickle.name + '\n');
        }

        logTestStep({testCase, index, result}) {
          const {gherkinKeyword, pickleStep, testStep} = this.eventDataCollector.getTestStepData({testCase, index})
          if (pickleStep) {
            this.log('  ' + gherkinKeyword + pickleStep.text + ' - ' + result.status + '\n');
          } else {
            this.log('  Hook - ' + result.status + '\n');
          }
        }

        logSeparator() {
          this.log('\n');
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

               Given('an undefined step', function (callback) {
                 // Write code here that turns the phrase above into concrete actions
                 callback(null, 'pending');
               });


      1 scenario (1 undefined)
      1 step (1 undefined)
      <duration-stat>
      """
