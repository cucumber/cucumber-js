function Scenario(astScenario, scenarioResult) {
  var Cucumber = require('../../cucumber');

  var attachments = [];

  function isStream(value) {
    return value && typeof value === 'object' && typeof value.pipe === 'function';
  }

  function attachData(data, mimeType) {
    var attachment = Cucumber.Runtime.Attachment({mimeType: mimeType, data: data});
    attachments.push(attachment);
  }

  function attachStream(stream, mimeType, callback) {
    var buffers = [];

    stream.on('data', function (chunk) {
      buffers.push(chunk);
    });
    stream.on('end', function () {
      attachData(Buffer.concat(buffers), mimeType);
      callback();
    });
  }

  var self = {
    getKeyword:     function getKeyword()     { return astScenario.getKeyword(); },
    getName:        function getName()        { return astScenario.getName(); },
    getDescription: function getDescription() { return astScenario.getDescription(); },
    getUri:         function getUri()         { return astScenario.getUri(); },
    getLine:        function getLine()        { return astScenario.getLine(); },
    getTags:        function getTags()        { return astScenario.getTags(); },
    isSuccessful:   function isSuccessful()   { return scenarioResult.getStatus() === Cucumber.Status.PASSED; },
    isFailed:       function isFailed()       { return scenarioResult.getStatus() === Cucumber.Status.FAILED; },
    isPending:      function isPending()      { return scenarioResult.getStatus() === Cucumber.Status.PENDING; },
    isUndefined:    function isUndefined()    { return scenarioResult.getStatus() === Cucumber.Status.UNDEFINED; },
    isSkipped:      function isSkipped()      { return scenarioResult.getStatus() === Cucumber.Status.SKIPPED; },
    getException:   function getException()   { return scenarioResult.getFailureException(); },
    getAttachments: function getAttachments() { return attachments; },
    clearAttachments: function clearAttachments() { attachments = []; },

    attach: function attach(data, mimeType, callback) {
      if (isStream(data)) {
        if (!mimeType)
          throw Error(Scenario.ATTACH_MISSING_MIME_TYPE_ARGUMENT);
        if (!callback)
          throw Error(Scenario.ATTACH_MISSING_CALLBACK_ARGUMENT_FOR_STREAM_READABLE);

        attachStream(data, mimeType, callback);
      }
      else if (Buffer && Buffer.isBuffer(data)) {
        if (!mimeType)
          throw Error(Scenario.ATTACH_MISSING_MIME_TYPE_ARGUMENT);

        attachData(data, mimeType);
        if (callback) callback();
      }
      else if (typeof(data) === 'string') {
        if (!mimeType)
          mimeType = Scenario.DEFAULT_TEXT_MIME_TYPE;

        attachData(data, mimeType);
        if (callback) callback();
      } else {
        throw Error(Scenario.ATTACH_INVALID_DATA_TYPE);
      }
    }
  };

  return self;
}

Scenario.DEFAULT_TEXT_MIME_TYPE = 'text/plain';
Scenario.ATTACH_MISSING_MIME_TYPE_ARGUMENT = 'Cucumber.Api.Scenario.attach() expects a mimeType';
Scenario.ATTACH_MISSING_CALLBACK_ARGUMENT_FOR_STREAM_READABLE = 'Cucumber.Api.Scenario.attach() expects a callback when data is a stream.Readable';
Scenario.ATTACH_INVALID_DATA_TYPE = 'Cucumber.Api.Scenario.attach() expects data to be a stream, buffer, or string.';

module.exports = Scenario;
