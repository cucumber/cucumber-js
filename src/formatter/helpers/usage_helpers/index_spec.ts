import { expect } from 'chai'
import { describe, it } from 'mocha'

import { getEnvelopesAndEventDataCollector } from '../../../../test/formatter_helpers'
import { buildSupportCodeLibrary } from '../../../../test/runtime_helpers'
import { getUsage } from './'

describe('Usage Helpers', () => {
  describe('getUsage', () => {
    describe('with step definitions', () => {
      describe('without function definition wrapper', () => {
        it('includes stringified code', async () => {
          // Arrange
          const code = function (): string {
            return 'original code'
          }
          const supportCodeLibrary = buildSupportCodeLibrary(({ Given }) => {
            Given('a step', code)
          })
          const { eventDataCollector } =
            await getEnvelopesAndEventDataCollector({ supportCodeLibrary })

          // Act
          const output = getUsage({
            cwd: '/project',
            eventDataCollector,
            stepDefinitions: supportCodeLibrary.stepDefinitions,
          })

          // Assert
          expect(output).to.have.lengthOf(1)
          expect(output[0].code).to.eql(code.toString())
        })
      })

      describe('with function definition wrapper', () => {
        it('includes unwrapped version of stringified code', async () => {
          // Arrange
          const code = function (): string {
            return 'original code'
          }
          const supportCodeLibrary = buildSupportCodeLibrary(
            ({ Given, setDefinitionFunctionWrapper }) => {
              Given('a step', code)
              setDefinitionFunctionWrapper(
                (fn: Function) =>
                  function (fn: Function) {
                    if (fn.length === 1) {
                      return fn
                    }
                    return fn
                  }
              )
            }
          )
          const { eventDataCollector } =
            await getEnvelopesAndEventDataCollector({ supportCodeLibrary })

          // Act
          const output = getUsage({
            cwd: '/project',
            eventDataCollector,
            stepDefinitions: supportCodeLibrary.stepDefinitions,
          })

          // Assert
          expect(output).to.have.lengthOf(1)
          expect(output[0].code).to.eql(code.toString())
        })
      })
    })
  })
})
