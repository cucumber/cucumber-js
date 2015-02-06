function Attachment(payload) {
  var self = {
    getMimeType:  function getMimeType()  { return payload.mimeType; },
    getData:      function getData()      { return payload.data; }
  };

  return self;
}

module.exports = Attachment;
