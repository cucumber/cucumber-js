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
          keyword: 'Given ',
          language: 'en'
        })
      })

      it('returns precondition', function() {
        expect(this.keywordType).to.eql(KeywordType.PRECONDITION)
      })
    })

    describe('keyword is When', function() {
      beforeEach(function() {
        this.keywordType = getStepKeywordType({
          keyword: 'When ',
          language: 'en'
        })
      })

      it('returns event', function() {
        expect(this.keywordType).to.eql(KeywordType.EVENT)
      })
    })

    describe('keyword is Then', function() {
      beforeEach(function() {
        this.keywordType = getStepKeywordType({
          keyword: 'Then ',
          language: 'en'
        })
      })

      it('returns outcome', function() {
        expect(this.keywordType).to.eql(KeywordType.OUTCOME)
      })
    })

    describe('keyword is And, no previous step', function() {
      beforeEach(function() {
        this.keywordType = getStepKeywordType({
          keyword: 'And ',
          language: 'en'
        })
      })

      it('returns precondition', function() {
        expect(this.keywordType).to.eql(KeywordType.PRECONDITION)
      })
    })

    describe('keyword is And, previous keyword type is event', function() {
      beforeEach(function() {
        this.keywordType = getStepKeywordType({
          keyword: 'And ',
          language: 'en',
          previousKeywordType: KeywordType.EVENT
        })
      })

      it('returns event', function() {
        expect(this.keywordType).to.eql(KeywordType.EVENT)
      })
    })

    describe('keyword is But, no previous step', function() {
      beforeEach(function() {
        this.keywordType = getStepKeywordType({
          keyword: 'But ',
          language: 'en'
        })
      })

      it('returns precondition', function() {
        expect(this.keywordType).to.eql(KeywordType.PRECONDITION)
      })
    })

    describe('keyword is But, previous keyword type is outcome', function() {
      beforeEach(function() {
        this.keywordType = getStepKeywordType({
          keyword: 'But ',
          language: 'en',
          previousKeywordType: KeywordType.OUTCOME
        })
      })

      it('returns outcome', function() {
        expect(this.keywordType).to.eql(KeywordType.OUTCOME)
      })
    })

    describe('keyword is unknown', function() {
      beforeEach(function() {
        this.keywordType = getStepKeywordType({
          index: 0,
          language: 'en',
          stepKeywords: ['other ']
        })
      })

      it('returns precondition', function() {
        expect(this.keywordType).to.eql(KeywordType.PRECONDITION)
      })
    })
  })
})
