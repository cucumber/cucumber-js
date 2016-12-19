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
        handleBeforeScenario(scenario) {
          this.log(scenario.feature.name + ' / ' + scenario.name + '\n');
        }

        handleStepResult(stepResult) {
          const {status, step} = stepResult;
          this.log('  ' + step.keyword + step.name + ' - ' + status + '\n');
        }

        handleAfterScenario() {
          this.log('\n');
        }

        handleFeaturesResult(featuresResult) {
          this.log(featuresResult.success ? 'SUCCESS' : 'FAILURE');
        }
      }

      module.exports = SimpleFormatter
      """
    When I run cucumber-js with `--format ./simple_formatter.js`
    Then it outputs this text:
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
        handleBeforeScenario(scenario) {
          this.log(scenario.feature.name + ' / ' + scenario.name + '\n');
        }

        handleStepResult(stepResult) {
          const {status, step} = stepResult;
          this.log('  ' + step.keyword + step.name + ' - ' + status + '\n');
        }

        handleAfterScenario() {
          this.log('\n');
        }
      }

      module.exports = SimpleFormatter
      """
    When I run cucumber-js with `--format ./simple_formatter.js`
    Then it outputs this text:
      """
      a feature / a scenario
        Given an undefined step - undefined

      Warnings:

      1) Scenario: a scenario - features/a.feature:2
         Step: Given an undefined step - features/a.feature:3
         Message:
           Undefined. Implement with the following snippet:

             this.Given('an undefined step', function (callback) {
               // Write code here that turns the phrase above into concrete actions
               callback(null, 'pending');
             });

      1 scenario (1 undefined)
      1 step (1 undefined)
      <duration-stat>
      """
