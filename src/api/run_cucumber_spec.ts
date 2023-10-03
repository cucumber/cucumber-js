import { Envelope, TestStepResultStatus } from '@cucumber/messages'
import { expect } from 'chai'
import { runCucumber } from './run_cucumber'
import { IRunEnvironment } from './types'
import { loadSupport } from './load_support'
import { loadConfiguration } from './load_configuration'
import { setupEnvironment, teardownEnvironment } from './test_helpers'

describe('runCucumber', function () {
  this.timeout(10_000)

  describe('preloading support code', () => {
    let environment: IRunEnvironment
    beforeEach(async () => {
      environment = await setupEnvironment()
    })
    afterEach(async () => teardownEnvironment(environment))

    it('should be able to load support code upfront and supply it to runCucumber', async () => {
      const messages: Envelope[] = []
      const { runConfiguration } = await loadConfiguration({}, environment)
      const support = await loadSupport(runConfiguration, environment)
      await runCucumber(
        { ...runConfiguration, support },
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
    let environment: IRunEnvironment
    beforeEach(async () => {
      environment = await setupEnvironment()
    })
    afterEach(async () => teardownEnvironment(environment))

    it('successfully executes 2 test runs', async () => {
      const messages: Envelope[] = []
      const { runConfiguration } = await loadConfiguration({}, environment)
      const { support } = await runCucumber(
        runConfiguration,
        environment,
        (envelope) => messages.push(envelope)
      )
      await runCucumber(
        { ...runConfiguration, support },
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
