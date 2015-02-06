function Scenario(astTreeWalker, astScenario) {
  function isStream(value) {
    return value && typeof value === 'object' && typeof value.pipe === 'function';
  }

  var self = {
    getKeyword:     function getKeyword()     { return astScenario.getKeyword(); },
    getName:        function getName()        { return astScenario.getName(); },
    getDescription: function getDescription() { return astScenario.getDescription(); },
    getUri:         function getUri()         { return astScenario.getUri(); },
    getLine:        function getLine()        { return astScenario.getLine(); },
    getTags:        function getTags()        { return astScenario.getTags(); },
    isSuccessful:   function isSuccessful()   { return astTreeWalker.isScenarioSuccessful(); },
    isFailed:       function isFailed()       { return astTreeWalker.isScenarioFailed(); },
    isPending:      function isPending()      { return astTreeWalker.isScenarioPending(); },
    isUndefined:    function isUndefined()    { return astTreeWalker.isScenarioUndefined(); },
    getAttachments: function getAttachments() { return astTreeWalker.getAttachments(); },

    attach: function attach(data, mimeType, callback) {
      if (isStream(data)) {
        if (!mimeType)
          throw Error(Scenario.ATTACH_MISSING_MIME_TYPE_ARGUMENT);
        if (!callback)
          throw Error(Scenario.ATTACH_MISSING_CALLBACK_ARGUMENT_FOR_STREAM_READABLE);

        var buffers = [];

        data.on('data', function (chunk) {
          buffers.push(chunk);
        });
        data.on('end', function () {
          astTreeWalker.attach(Buffer.concat(buffers).toString(), mimeType);

          callback();
        });
      }
      else if (Buffer && Buffer.isBuffer(data)) {
        if (!mimeType)
          throw Error(Scenario.ATTACH_MISSING_MIME_TYPE_ARGUMENT);

        astTreeWalker.attach(data.toString(), mimeType);

        if (callback) {
          callback();
        }
      }
      else {
        if (!mimeType) {
          mimeType = Scenario.DEFAULT_TEXT_MIME_TYPE;
        }

        astTreeWalker.attach(data.toString(), mimeType);
      }
    }
  };

  return self;
}

Scenario.DEFAULT_TEXT_MIME_TYPE = 'text/plain';
Scenario.ATTACH_MISSING_MIME_TYPE_ARGUMENT = 'Cucumber.Api.Scenario.attach() expects a mimeType';
Scenario.ATTACH_MISSING_CALLBACK_ARGUMENT_FOR_STREAM_READABLE = 'Cucumber.Api.Scenario.attach() expects a callback when data is a stream.Readable';

module.exports = Scenario;
