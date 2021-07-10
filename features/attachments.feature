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
      const {Given} = require('@cucumber/cucumber')

      Given(/^a step$/, function() {})
      """

  Scenario: Attach a buffer
    Given a file named "features/support/hooks.js" with:
      """
      const {Before} = require('@cucumber/cucumber')

      Before(function() {
        this.attach(Buffer.from([137, 80, 78, 71]), 'image/png')
      })
      """
    When I run cucumber-js
    Then scenario "some scenario" "Before" hook has the attachments:
      | DATA     | MEDIA TYPE | MEDIA ENCODING |
      | iVBORw== | image/png  | BASE64         |

  Scenario: Attach a string that is already base64 encoded
    Given a file named "features/support/hooks.js" with:
      """
      const {Before} = require('@cucumber/cucumber')

      Before(function() {
        this.attach(Buffer.from([137, 80, 78, 71]).toString('base64'), 'base64:image/png')
      })
      """
    When I run cucumber-js
    Then scenario "some scenario" "Before" hook has the attachments:
      | DATA     | MEDIA TYPE | MEDIA ENCODING |
      | iVBORw== | image/png  | BASE64         |

  Scenario: Attach a stream (callback)
    Given a file named "features/support/hooks.js" with:
      """
      const {Before} = require('@cucumber/cucumber')
      const stream = require('stream')

      Before(function(testCase, callback) {
        var passThroughStream = new stream.PassThrough()
        this.attach(passThroughStream, 'image/png', callback)
        passThroughStream.write(Buffer.from([137, 80]))
        passThroughStream.write(Buffer.from([78, 71]))
        passThroughStream.end()
      })
      """
    When I run cucumber-js
    Then scenario "some scenario" "Before" hook has the attachments:
      | DATA     | MEDIA TYPE | MEDIA ENCODING |
      | iVBORw== | image/png  | BASE64         |

  Scenario: Attach a stream (promise)
    Given a file named "features/support/hooks.js" with:
        """
        const {Before} = require('@cucumber/cucumber')
        const stream = require('stream')

        Before(function() {
          var passThroughStream = new stream.PassThrough()
          var promise = this.attach(passThroughStream, 'image/png')
          passThroughStream.write(Buffer.from([137, 80]))
          passThroughStream.write(Buffer.from([78, 71]))
          passThroughStream.end()
          return promise
        })
        """
    When I run cucumber-js
    Then scenario "some scenario" "Before" hook has the attachments:
      | DATA     | MEDIA TYPE | MEDIA ENCODING |
      | iVBORw== | image/png  | BASE64         |

  Scenario: Attach from a before hook
    Given a file named "features/support/hooks.js" with:
      """
      const {Before} = require('@cucumber/cucumber')

      Before(function() {
        this.attach("text")
      })
      """
    When I run cucumber-js
    Then scenario "some scenario" "Before" hook has the attachments:
      | DATA | MEDIA TYPE | MEDIA ENCODING |
      | text | text/plain | IDENTITY       |

  Scenario: Attach from an after hook
    Given a file named "features/support/hooks.js" with:
      """
      const {After} = require('@cucumber/cucumber')

      After(function() {
        this.attach("text")
      })
      """
    When I run cucumber-js
    Then scenario "some scenario" "After" hook has the attachments:
      | DATA | MEDIA TYPE | MEDIA ENCODING |
      | text | text/plain | IDENTITY       |

  Scenario: Attach from a step definition
    Given a file named "features/step_definitions/cucumber_steps.js" with:
      """
      const {Given} = require('@cucumber/cucumber')

      Given(/^a step$/, function() {
        this.attach("text")
      })
      """
    When I run cucumber-js
    Then scenario "some scenario" step "Given a step" has the attachments:
      | DATA | MEDIA TYPE | MEDIA ENCODING |
      | text | text/plain | IDENTITY       |

  @spawn
  Scenario: Attaching after hook/step finishes
    Given a file named "features/support/hooks.js" with:
      """
      const {After} = require('@cucumber/cucumber')

      After(function() {
        // Do not use the callback / promise interface so that the attach happens after the hook completes
        setTimeout(() => {
          this.attach("text")
        }, 100)
      })
      """
    When I run cucumber-js
    Then it fails
    And the error output contains the text:
      """
      Cannot attach when a step/hook is not running. Ensure your step/hook waits for the attach to finish.
      """
