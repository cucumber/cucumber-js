import DataTable from './step_arguments/data_table'
import DocString from './step_arguments/doc_string'
import KeywordType from '../keyword_type'
import Step from './step'

describe('Step', function () {
  beforeEach(function() {
    this.gherkinData = {
      locations: [{line: 2, path: '/path/to/feature'}]
    }
    this.lineToKeywordMapping = {}
    this.stepOptions = {
      backgroundLines: [],
      gherkinData: this.gherkinData,
      language: 'en',
      lineToKeywordMapping: this.lineToKeywordMapping
    }
  })

  describe('arguments', function () {
    describe('with content', function() {
      beforeEach(function() {
        this.gherkinData.arguments = [
          {content: 'data', location: {line: 3}}
        ]
        this.step = new Step(this.stepOptions)
      })

      it('returns a DocString', function () {
        expect(this.step.arguments).to.have.lengthOf(1)
        expect(this.step.arguments[0]).to.be.instanceOf(DocString)
      })
    })

    describe('with rows', function() {
      beforeEach(function() {
        const rows = [
          {cells: [{value: 1}, {value: 2}]},
          {cells: [{value: 3}, {value: 4}]}
        ]
        this.gherkinData.arguments = [{rows}]
        this.step = new Step(this.stepOptions)
      })

      it('returns a DataTable', function () {
        expect(this.step.arguments).to.have.lengthOf(1)
        expect(this.step.arguments[0]).to.be.instanceOf(DataTable)
      })
    })

    describe('with unknown argument', function() {
      it('throws', function() {
        this.gherkinData.arguments = [{some: 'data'}]
        expect(() => {
          new Step(this.stepOptions)
        }).to.throw('Unknown step argument type: {"some":"data"}')
      })
    })
  })

  describe('isBackground', function () {
    describe('step is from a background', function() {
      beforeEach(function() {
        this.stepOptions.backgroundLines = [2]
        this.step = new Step(this.stepOptions)
      })

      it('returns true', function () {
        expect(this.step.isBackground).to.be.true
      })
    })

    describe('step is not from a background', function() {
      beforeEach(function() {
        this.step = new Step(this.stepOptions)
      })

      it('returns false', function () {
        expect(this.step.isBackground).to.be.false
      })
    })
  })

  describe('keyword', function () {
    beforeEach(function() {
      this.lineToKeywordMapping[2] = 'keyword '
      this.step = new Step(this.stepOptions)
    })

    it('returns the keyword', function () {
      expect(this.step.keyword).to.eql('keyword ')
    })
  })

  describe('keywordType', function() {
    describe('keyword is Given', function(){
      beforeEach(function() {
        this.lineToKeywordMapping[2] = 'Given '
        this.step = new Step(this.stepOptions)
      })

      it('returns precondition', function() {
        expect(this.step.keywordType).to.eql(KeywordType.PRECONDITION)
      })
    })

    describe('keyword is When', function(){
      beforeEach(function() {
        this.lineToKeywordMapping[2] = 'When '
        this.step = new Step(this.stepOptions)
      })

      it('returns event', function() {
        expect(this.step.keywordType).to.eql(KeywordType.EVENT)
      })
    })

    describe('keyword is Then', function(){
      beforeEach(function() {
        this.lineToKeywordMapping[2] = 'Then '
        this.step = new Step(this.stepOptions)
      })

      it('returns outcome', function() {
        expect(this.step.keywordType).to.eql(KeywordType.OUTCOME)
      })
    })

    describe('keyword is And, no previous step', function(){
      beforeEach(function() {
        this.lineToKeywordMapping[2] = 'And '
        this.step = new Step(this.stepOptions)
      })

      it('returns precondition', function() {
        expect(this.step.keywordType).to.eql(KeywordType.PRECONDITION)
      })
    })

    describe('keyword is And, previous step keyword type is is EVENT', function(){
      beforeEach(function() {
        this.lineToKeywordMapping[2] = 'And '
        this.stepOptions.previousStep = {keywordType: KeywordType.EVENT}
        this.step = new Step(this.stepOptions)
      })

      it('returns precondition', function() {
        expect(this.step.keywordType).to.eql(KeywordType.EVENT)
      })
    })

    describe('keyword is But, no previous step', function(){
      beforeEach(function() {
        this.lineToKeywordMapping[2] = 'But '
        this.step = new Step(this.stepOptions)
      })

      it('returns precondition', function() {
        expect(this.step.keywordType).to.eql(KeywordType.PRECONDITION)
      })
    })

    describe('keyword is But, previous step keyword type is OUTCOME', function(){
      beforeEach(function() {
        this.lineToKeywordMapping[2] = 'But '
        this.stepOptions.previousStep = {keywordType: KeywordType.OUTCOME}
        this.step = new Step(this.stepOptions)
      })

      it('returns outcome', function() {
        expect(this.step.keywordType).to.eql(KeywordType.OUTCOME)
      })
    })

    describe('keyword is unknown', function(){
      beforeEach(function() {
        this.lineToKeywordMapping[1] = 'other '
        this.step = new Step(this.stepOptions)
      })

      it('returns precondition', function() {
        expect(this.step.keywordType).to.eql(KeywordType.PRECONDITION)
      })
    })
  })

  describe('line', function () {
    beforeEach(function() {
      this.gherkinData.locations = [{line: 1}, {line: 2}]
      this.step = new Step(this.stepOptions)
    })

    it('returns the last line number', function () {
      expect(this.step.line).to.eql(2)
    })
  })

  describe('name', function () {
    beforeEach(function() {
      this.gherkinData.text = 'text'
      this.step = new Step(this.stepOptions)
    })

    it('returns the text', function () {
      expect(this.step.name).to.eql('text')
    })
  })

  describe('scenario', function () {
    beforeEach(function() {
      this.stepOptions.scenario = {scenario: 'data'}
      this.step = new Step(this.stepOptions)
    })

    it('returns the scenario', function () {
      expect(this.step.scenario).to.eql({scenario: 'data'})
    })
  })

  describe('uri', function () {
    beforeEach(function() {
      this.gherkinData.locations = [{path: 'path1'}, {path: 'path2'}]
      this.step = new Step(this.stepOptions)
    })

    it('returns the first path', function () {
      expect(this.step.uri).to.eql('path1')
    })
  })
})
