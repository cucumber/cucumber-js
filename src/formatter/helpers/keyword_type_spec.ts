import { describe, it } from 'mocha'
import { expect } from 'chai'
import { getStepKeywordType, KeywordType } from './keyword_type'

describe('KeywordType', () => {
  describe('getStepKeywordType()', () => {
    describe('keyword is Given', () => {
      it('returns precondition', function () {
        // Arrange

        // Act
        const result = getStepKeywordType({
          keyword: 'Given ',
          language: 'en',
        })

        // Assert
        expect(result).to.eql(KeywordType.Precondition)
      })
    })

    describe('keyword is When', () => {
      it('returns event', function () {
        // Arrange

        // Act
        const result = getStepKeywordType({
          keyword: 'When ',
          language: 'en',
        })

        // Assert
        expect(result).to.eql(KeywordType.Event)
      })
    })

    describe('keyword is Then', () => {
      it('returns outcome', function () {
        // Arrange

        // Act
        const result = getStepKeywordType({
          keyword: 'Then ',
          language: 'en',
        })

        // Assert
        expect(result).to.eql(KeywordType.Outcome)
      })
    })

    describe('keyword is And, no previous step', () => {
      it('returns precondition', function () {
        // Arrange

        // Act
        const result = getStepKeywordType({
          keyword: 'And ',
          language: 'en',
        })

        // Assert
        expect(result).to.eql(KeywordType.Precondition)
      })
    })

    describe('keyword is And, previous keyword type is event', () => {
      it('returns event', function () {
        // Arrange

        // Act
        const result = getStepKeywordType({
          keyword: 'And ',
          language: 'en',
          previousKeywordType: KeywordType.Event,
        })

        // Assert
        expect(result).to.eql(KeywordType.Event)
      })
    })

    describe('keyword is But, no previous step', () => {
      it('returns precondition', function () {
        // Arrange

        // Act
        const result = getStepKeywordType({
          keyword: 'But ',
          language: 'en',
        })

        // Assert
        expect(result).to.eql(KeywordType.Precondition)
      })
    })

    describe('keyword is But, previous keyword type is outcome', () => {
      it('returns outcome', function () {
        // Arrange

        // Act
        const result = getStepKeywordType({
          keyword: 'And ',
          language: 'en',
          previousKeywordType: KeywordType.Outcome,
        })

        // Assert
        expect(result).to.eql(KeywordType.Outcome)
      })
    })

    describe('keyword is unknown', () => {
      it('returns precondition', function () {
        // Arrange

        // Act
        const result = getStepKeywordType({
          keyword: 'Other ',
          language: 'en',
        })

        // Assert
        expect(result).to.eql(KeywordType.Precondition)
      })
    })
  })
})
