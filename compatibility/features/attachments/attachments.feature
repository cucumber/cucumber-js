Feature: Attachments
  It is sometimes useful to take a screenshot while a scenario runs.
  Or capture some logs.

  Cucumber lets you `attach` arbitrary files during execution, and you can
  specify a content type for the contents.

  Formatters can then render these attachments in reports.

  Attachments must have a body and a content type

  Scenario: Strings can be attached with a media type
    Beware that some formatters such as @cucumber/react use the media type
    to determine how to display an attachment.

    When the string "hello" is attached as "application/octet-stream"

  Scenario: Log JSON
     When the following string is attached as "application/json":
       ```
       {"message": "The <b>big</b> question", "foo": "bar"}
       ```

  Scenario: Log text
    When the string "hello" is logged

  Scenario: Log ANSI coloured text
     When text with ANSI escapes is logged

  Scenario: Byte arrays are base64-encoded regardless of media type
    When an array with 10 bytes is attached as "text/plain"

  Scenario: Streams are always base64-encoded
    When a JPEG image is attached
