require('../../support/spec_helper');

describe("Cucumber.Runtime.Attachment", function () {
  var Cucumber = requireLib('cucumber');
  var attachment, mimeType, data, payload;

  beforeEach(function () {
    mimeType = createSpy("mime type");
    data     = createSpy("data");
    payload  = { mimeType: mimeType, data: data };

    attachment = Cucumber.Runtime.Attachment(payload);
  });

  describe("getMimeType()", function () {
    it("returns the mime type", function () {
      expect(attachment.getMimeType()).toBe(mimeType);
    });
  });

  describe("getData()", function () {
    it("returns the data", function () {
      expect(attachment.getData()).toBe(data);
    });
  });
});
