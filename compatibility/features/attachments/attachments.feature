Feature: Attachments
  It is sometimes useful to take a screenshot while a scenario runs.
  Or capture some logs.

  Cucumber lets you `attach` arbitrary files during execution, and you can
  specify a content type for the contents.

  Formatters can then render these attachments in reports.

  Attachments must have a body and a content type

  Scenario: Strings are identity-encoded regardless of media type
    Beware that some formatters such as @cucumber/react use the media type
    to determine how to display an attachment.
  
    When the string "hello" is attached as "application/octet-stream"

  Scenario: Log text
    When the string "hello" is logged

  Scenario: Byte arrays are base64-encoded regardless of media type
    When an array with 10 bytes are attached as "text/plain"

  Scenario: Streams are always base64-encoded
    When a JPEG image is attached
