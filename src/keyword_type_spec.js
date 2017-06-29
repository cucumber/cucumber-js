import KeywordType, { getStepKeywordType } from './keyword_type'

describe('KeywordType', function() {
  describe('constants', function() {
    it('exposes the proper constants', function() {
      expect(KeywordType).to.include.keys(['EVENT', 'OUTCOME', 'PRECONDITION'])
    })
  })

  describe('getStepKeywordType()', function() {
    describe('keyword is Given', function() {
      beforeEach(function() {
        this.keywordType = getStepKeywordType({
          language: 'en',
          step: { keyword: 'Given ' }
        })
      })

      it('returns precondition', function() {
        expect(this.keywordType).to.eql(KeywordType.PRECONDITION)
      })
    })

    describe('keyword is When', function() {
      beforeEach(function() {
        this.keywordType = getStepKeywordType({
          language: 'en',
          step: { keyword: 'When ' }
        })
      })

      it('returns event', function() {
        expect(this.keywordType).to.eql(KeywordType.EVENT)
      })
    })

    describe('keyword is Then', function() {
      beforeEach(function() {
        this.keywordType = getStepKeywordType({
          language: 'en',
          step: { keyword: 'Then ' }
        })
      })

      it('returns outcome', function() {
        expect(this.keywordType).to.eql(KeywordType.OUTCOME)
      })
    })

    describe('keyword is And, no previous step', function() {
      beforeEach(function() {
        this.keywordType = getStepKeywordType({
          language: 'en',
          step: { keyword: 'And ' }
        })
      })

      it('returns precondition', function() {
        expect(this.keywordType).to.eql(KeywordType.PRECONDITION)
      })
    })

    describe('keyword is And, previous step keyword type is EVENT', function() {
      beforeEach(function() {
        this.keywordType = getStepKeywordType({
          language: 'en',
          previousStep: { keywordType: KeywordType.EVENT },
          step: { keyword: 'And ' }
        })
      })

      it('returns precondition', function() {
        expect(this.keywordType).to.eql(KeywordType.EVENT)
      })
    })

    describe('keyword is But, no previous step', function() {
      beforeEach(function() {
        this.keywordType = getStepKeywordType({
          language: 'en',
          step: { keyword: 'But ' }
        })
      })

      it('returns precondition', function() {
        expect(this.keywordType).to.eql(KeywordType.PRECONDITION)
      })
    })

    describe('keyword is But, previous step keyword type is OUTCOME', function() {
      beforeEach(function() {
        this.keywordType = getStepKeywordType({
          language: 'en',
          previousStep: { keywordType: KeywordType.OUTCOME },
          step: { keyword: 'But ' }
        })
      })

      it('returns outcome', function() {
        expect(this.keywordType).to.eql(KeywordType.OUTCOME)
      })
    })

    describe('keyword is unknown', function() {
      beforeEach(function() {
        this.keywordType = getStepKeywordType({
          language: 'en',
          step: { keyword: 'other ' }
        })
      })

      it('returns precondition', function() {
        expect(this.keywordType).to.eql(KeywordType.PRECONDITION)
      })
    })
  })
})
