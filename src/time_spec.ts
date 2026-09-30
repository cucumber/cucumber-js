import FakeTimers, { type InstalledClock } from '@sinonjs/fake-timers'
import { expect } from 'chai'
import { afterEach, beforeEach, describe, it } from 'mocha'
import timeMethods, { wrapPromiseWithTimeout } from './time'

describe('wrapPromiseWithTimeout()', () => {
  let clock: InstalledClock

  beforeEach(() => {
    clock = FakeTimers.withGlobal(timeMethods).install()
  })

  afterEach(() => {
    clock.uninstall()
  })

  describe('promise times out (default timeout message)', () => {
    it('rejects the promise', async () => {
      // Arrange
      const promise = new Promise((resolve) => {
        timeMethods.setTimeout(resolve, 50)
      })

      // Act
      const wrapped = wrapPromiseWithTimeout(promise, 25)
      clock.tick(25)
      let error: Error = null
      try {
        await wrapped
      } catch (e) {
        error = e
      }

      // Assert
      expect(error).to.exist()
      expect(error.message).to.eql('Action did not complete within 25 milliseconds')
    })
  })

  describe('promise times out (supplied timeout message)', () => {
    it('rejects the promise', async () => {
      // Arrange
      const promise = new Promise((resolve) => {
        timeMethods.setTimeout(resolve, 50)
      })

      // Act
      const wrapped = wrapPromiseWithTimeout(promise, 25, 'custom timeout message')
      clock.tick(25)
      let error: Error = null
      try {
        await wrapped
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
        timeMethods.setTimeout(() => resolve('value'), 10)
      })

      // Act
      const wrapped = wrapPromiseWithTimeout(promise, 25)
      clock.tick(10)
      const result = await wrapped

      // Assert
      expect(result).to.eql('value')
    })
  })
})
