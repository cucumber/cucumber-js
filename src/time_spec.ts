import { describe, it } from 'mocha'
import { expect } from 'chai'
import { wrapPromiseWithTimeout } from './time'

describe('wrapPromiseWithTimeout()', () => {
  describe('promise times out (default timeout message)', () => {
    it('rejects the promise', async () => {
      // Arrange
      const promise = new Promise((resolve) => {
        setTimeout(resolve, 50)
      })

      // Act
      let error: Error = null
      try {
        await wrapPromiseWithTimeout(promise, 25)
      } catch (e) {
        error = e
      }

      // Assert
      expect(error).to.exist()
      expect(error.message).to.eql(
        'Action did not complete within 25 milliseconds'
      )
    })
  })

  describe('promise times out (supplied timeout message)', () => {
    it('rejects the promise', async () => {
      // Arrange
      const promise = new Promise((resolve) => {
        setTimeout(resolve, 50)
      })

      // Act
      let error: Error = null
      try {
        await wrapPromiseWithTimeout(promise, 25, 'custom timeout message')
      } catch (e) {
        error = e
      }

      // Assert
      expect(error).to.exist()
      expect(error.message).to.eql('custom timeout message')
    })
  })

  describe('promise does not time out', () => {
    it('resolves the promise', async () => {
      // Arrange
      const promise = new Promise<string>((resolve) => {
        setTimeout(() => resolve('value'), 10)
      })

      // Act
      const result = await wrapPromiseWithTimeout(promise, 25)

      // Assert
      expect(result).to.eql('value')
    })
  })
})
