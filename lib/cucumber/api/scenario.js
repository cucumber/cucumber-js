var Scenario = function (payload) {
  var self = {
    getKeyword:     function getKeyword()     { return payload.scenario.getKeyword(); },
    getName:        function getName()        { return payload.scenario.getName(); },
    getDescription: function getDescription() { return payload.scenario.getDescription(); },
    getUri:         function getUri()         { return payload.scenario.getUri(); },
    getLine:        function getLine()        { return payload.scenario.getLine(); },
    getTags:        function getTags()        { return payload.scenario.getTags(); },
    isFailed:       function isFailed()       { return payload.isFailed; },
    isPending:      function isPending()      { return payload.isPending; },
    isSuccessful:   function isSuccessful()   { return payload.isSuccessful; },
    isUndefined:    function isUndefined()    { return payload.isUndefined; }
  };

  return self;
};

module.exports = Scenario;