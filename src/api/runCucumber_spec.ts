import { IRunConfiguration, IUserConfiguration } from '../configuration'
import { runCucumber } from './runCucumber'
import { IRunEnvironment } from './types'
import { Envelope, TestStepResultStatus } from '@cucumber/messages'
import { expect } from 'chai'
import { loadSupport } from './loadSupport'

const environment: Partial<IRunEnvironment> = {
  cwd: __dirname,
}

describe('runCucumber', () => {
  describe('preloading support code', () => {
    it('should work when ', async () => {
      const messages: Envelope[] = []
      const configuration: IUserConfiguration = {
        sources: {
          paths: ['fixtures/fixture.feature'],
        },
        support: {
          requireModules: ['ts-node/register'],
          requirePaths: ['fixtures/steps.ts'],
          importPaths: [],
        },
      }
      const support = await loadSupport(configuration, environment)
      await runCucumber(
        { ...configuration, support },
        environment,
        (envelope) => messages.push(envelope)
      )
      const testStepFinishedEnvelopes = messages.filter(
        (envelope) => envelope.testStepFinished
      )
      expect(testStepFinishedEnvelopes).to.have.length(2)
      expect(
        testStepFinishedEnvelopes.every(
          (envelope) =>
            envelope.testStepFinished.testStepResult.status ===
            TestStepResultStatus.PASSED
        )
      ).to.be.true()
    })
  })

  describe('reusing support code across runs', () => {
    it('successfully executes 2 test runs', async () => {
      const messages: Envelope[] = []
      const configuration: IUserConfiguration = {
        sources: {
          paths: ['fixtures/fixture.feature'],
        },
        support: {
          requireModules: ['ts-node/register'],
          requirePaths: ['fixtures/steps.ts'],
          importPaths: [],
        },
      }
      const { support } = await runCucumber(
        configuration,
        environment,
        (envelope) => messages.push(envelope)
      )
      await runCucumber(
        { ...configuration, support },
        environment,
        (envelope) => messages.push(envelope)
      )

      const testStepFinishedEnvelopes = messages.filter(
        (envelope) => envelope.testStepFinished
      )
      const testRunFinishedEnvelopes = messages.filter(
        (envelope) => envelope.testRunFinished
      )
      expect(testStepFinishedEnvelopes).to.have.length(4)
      expect(
        testStepFinishedEnvelopes.every(
          (envelope) =>
            envelope.testStepFinished.testStepResult.status ===
            TestStepResultStatus.PASSED
        )
      ).to.be.true()
      expect(testRunFinishedEnvelopes).to.have.length(2)
      expect(
        testRunFinishedEnvelopes.every(
          (envelope) => envelope.testRunFinished.success === true
        )
      ).to.be.true()
    })
  })
})
