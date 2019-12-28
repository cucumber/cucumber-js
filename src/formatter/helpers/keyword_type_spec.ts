import { beforeEach, describe, it } from 'mocha'
import { expect } from 'chai'
import { KeywordType, getStepKeywordType } from './keyword_type'

describe('KeywordType', () => {
  describe('getStepKeywordType()', () => {
    describe('keyword is Given', () => {
      beforeEach(function() {
        this.keywordType = getStepKeywordType({
          keyword: 'Given ',
          language: 'en',
        })
      })

      it('returns precondition', function() {
        expect(this.keywordType).to.eql(KeywordType.Precondition)
      })
    })

    describe('keyword is When', () => {
      beforeEach(function() {
        this.keywordType = getStepKeywordType({
          keyword: 'When ',
          language: 'en',
        })
      })

      it('returns event', function() {
        expect(this.keywordType).to.eql(KeywordType.Event)
      })
    })

    describe('keyword is Then', () => {
      beforeEach(function() {
        this.keywordType = getStepKeywordType({
          keyword: 'Then ',
          language: 'en',
        })
      })

      it('returns outcome', function() {
        expect(this.keywordType).to.eql(KeywordType.Outcome)
      })
    })

    describe('keyword is And, no previous step', () => {
      beforeEach(function() {
        this.keywordType = getStepKeywordType({
          keyword: 'And ',
          language: 'en',
        })
      })

      it('returns precondition', function() {
        expect(this.keywordType).to.eql(KeywordType.Precondition)
      })
    })

    describe('keyword is And, previous keyword type is event', () => {
      beforeEach(function() {
        this.keywordType = getStepKeywordType({
          keyword: 'And ',
          language: 'en',
          previousKeywordType: KeywordType.Event,
        })
      })

      it('returns event', function() {
        expect(this.keywordType).to.eql(KeywordType.Event)
      })
    })

    describe('keyword is But, no previous step', () => {
      beforeEach(function() {
        this.keywordType = getStepKeywordType({
          keyword: 'But ',
          language: 'en',
        })
      })

      it('returns precondition', function() {
        expect(this.keywordType).to.eql(KeywordType.Precondition)
      })
    })

    describe('keyword is But, previous keyword type is outcome', () => {
      beforeEach(function() {
        this.keywordType = getStepKeywordType({
          keyword: 'But ',
          language: 'en',
          previousKeywordType: KeywordType.Outcome,
        })
      })

      it('returns outcome', function() {
        expect(this.keywordType).to.eql(KeywordType.Outcome)
      })
    })

    describe('keyword is unknown', () => {
      beforeEach(function() {
        this.keywordType = getStepKeywordType({
          keyword: 'Other ',
          language: 'en',
        })
      })

      it('returns precondition', function() {
        expect(this.keywordType).to.eql(KeywordType.Precondition)
      })
    })
  })
})
