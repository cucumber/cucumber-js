import { describe, it } from 'mocha'
import { expect } from 'chai'
import { getUsage } from './'
import { getEnvelopesAndEventDataCollector } from '../../../../test/formatter_helpers'
import { buildSupportCodeLibrary } from '../../../../test/runtime_helpers'

describe('Usage Helpers', () => {
  describe('getUsage', () => {
    describe('with step definitions', () => {
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
  })
})
