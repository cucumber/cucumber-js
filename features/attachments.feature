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
      import {Given} from 'cucumber'

      Given(/^a step$/, function() {})
      """

  Scenario: Attach a buffer
    Given a file named "features/support/hooks.js" with:
      """
      import {Before} from 'cucumber'

      Before(function() {
        this.attach(new Buffer([137, 80, 78, 71]), 'image/png')
      })
      """
    When I run cucumber-js
    Then the "Before" hook has the attachment
      | DATA     | MIME TYPE |
      | iVBORw== | image/png |

  Scenario: Attach a stream (callback)
    Given a file named "features/support/hooks.js" with:
      """
      import {Before} from 'cucumber'
      import stream from 'stream'

      Before(function(testCase, callback) {
        var passThroughStream = new stream.PassThrough()
        this.attach(passThroughStream, 'image/png', callback)
        passThroughStream.write(new Buffer([137, 80]))
        passThroughStream.write(new Buffer([78, 71]))
        passThroughStream.end()
      })
      """
    When I run cucumber-js
    Then the "Before" hook has the attachment
      | DATA     | MIME TYPE |
      | iVBORw== | image/png |

    Scenario: Attach a stream (promise)
      Given a file named "features/support/hooks.js" with:
        """
        import {Before} from 'cucumber'
        import stream from 'stream'

        Before(function() {
          var passThroughStream = new stream.PassThrough()
          var promise = this.attach(passThroughStream, 'image/png')
          passThroughStream.write(new Buffer([137, 80]))
          passThroughStream.write(new Buffer([78, 71]))
          passThroughStream.end()
          return promise
        })
        """
      When I run cucumber-js
      Then the "Before" hook has the attachment
        | DATA     | MIME TYPE |
        | iVBORw== | image/png |

  Scenario: Attach from a before hook
    Given a file named "features/support/hooks.js" with:
      """
      import {Before} from 'cucumber'

      Before(function() {
        this.attach("text")
      })
      """
    When I run cucumber-js
    Then the "Before" hook has the attachment
      | DATA | MIME TYPE  |
      | text | text/plain |

  Scenario: Attach from an after hook
    Given a file named "features/support/hooks.js" with:
      """
      import {After} from 'cucumber'

      After(function() {
        this.attach("text")
      })
      """
    When I run cucumber-js
    Then the "After" hook has the attachment
      | DATA | MIME TYPE  |
      | text | text/plain |

  Scenario: Attach from a step definition
    Given a file named "features/step_definitions/cucumber_steps.js" with:
      """
      import {Given} from 'cucumber'

      Given(/^a step$/, function() {
        this.attach("text")
      })
      """
    When I run cucumber-js
    Then the step "a step" has the attachment
      | DATA | MIME TYPE  |
      | text | text/plain |
