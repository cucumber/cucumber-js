import DocString from './doc_string'

describe('DocString', function () {
  beforeEach(function () {
    this.docString = new DocString({
      content: 'content',
      contentType: 'contentType',
      location: {line: 1}
    })
  })

  describe('content', function () {
    it('returns the content', function () {
      expect(this.docString.content).to.eql('content')
    })
  })

  describe('contentType', function () {
    it('returns the doc', function () {
      expect(this.docString.contentType).to.eql('contentType')
    })
  })

  describe('getLine()', function () {
    it('returns the line', function () {
      expect(this.docString.line).to.eql(1)
    })
  })
})
