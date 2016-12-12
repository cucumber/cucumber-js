Feature: Attachments

  Background:
    Given a file named "features/a.feature" with:
      """
      Feature: some feature
        Scenario: some scenario
          Given a step
      """
    And a file named "features/step_definitions/cucumber_steps.js" with:
      """
      var cucumberSteps = function() {
        this.Given(/^a step$/, function() {});
      };
      module.exports = cucumberSteps;
      """

  Scenario: Attach a buffer
    Given a file named "features/support/hooks.js" with:
      """
      var hooks = function () {
        this.Before(function() {
          this.attach(new Buffer([137, 80, 78, 71]), 'image/png');
        });
      };

      module.exports = hooks;
      """
    When I run cucumber.js
    Then the "Before" hook has the attachment
      | DATA     | MIME TYPE |
      | iVBORw== | image/png |

  Scenario: Attach a stream (callback)
    Given a file named "features/support/hooks.js" with:
      """
      var stream = require('stream');

      var hooks = function () {
        this.Before(function(scenarioResult, callback) {
          var passThroughStream = new stream.PassThrough();
          this.attach(passThroughStream, 'image/png', callback);
          passThroughStream.write(new Buffer([137, 80]));
          passThroughStream.write(new Buffer([78, 71]));
          passThroughStream.end();
        });
      };

      module.exports = hooks;
      """
    When I run cucumber.js
    Then the "Before" hook has the attachment
      | DATA     | MIME TYPE |
      | iVBORw== | image/png |

    Scenario: Attach a stream (promise)
      Given a file named "features/support/hooks.js" with:
        """
        var stream = require('stream');

        var hooks = function () {
          this.Before(function() {
            var passThroughStream = new stream.PassThrough();
            var promise = this.attach(passThroughStream, 'image/png');
            passThroughStream.write(new Buffer([137, 80]));
            passThroughStream.write(new Buffer([78, 71]));
            passThroughStream.end();
            return promise
          });
        };

        module.exports = hooks;
        """
      When I run cucumber.js
      Then the "Before" hook has the attachment
        | DATA     | MIME TYPE |
        | iVBORw== | image/png |

  Scenario: Attach from a before hook
    Given a file named "features/support/hooks.js" with:
      """
      var hooks = function () {
        this.Before(function() {
          this.attach("text");
        });
      };

      module.exports = hooks;
      """
    When I run cucumber.js
    Then the "Before" hook has the attachment
      | DATA | MIME TYPE  |
      | text | text/plain |

  Scenario: Attach from an after hook
    Given a file named "features/support/hooks.js" with:
      """
      var hooks = function () {
        this.After(function() {
          this.attach("text");
        });
      };

      module.exports = hooks;
      """
    When I run cucumber.js
    Then the "After" hook has the attachment
      | DATA | MIME TYPE  |
      | text | text/plain |

  Scenario: Attach from a step definition
    Given a file named "features/step_definitions/cucumber_steps.js" with:
      """
      var cucumberSteps = function() {
        this.Given(/^a step$/, function() {
          this.attach("text");
        });
      };
      module.exports = cucumberSteps;
      """
    When I run cucumber.js
    Then the step "a step" has the attachment
      | DATA | MIME TYPE  |
      | text | text/plain |
