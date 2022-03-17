import { Envelope, TestStepResultStatus, IdGenerator } from '@cucumber/messages'
import fs from 'mz/fs'
import path from 'path'
import { reindent } from 'reindent-template-literals'
import { PassThrough } from 'stream'
import { expect } from 'chai'
import { runCucumber } from './run_cucumber'
import { IRunEnvironment } from './types'
import { loadSupport } from './load_support'
import { loadConfiguration } from './load_configuration'

const newId = IdGenerator.uuid()

async function setupEnvironment(): Promise<Partial<IRunEnvironment>> {
  const cwd = path.join(__dirname, '..', '..', 'tmp', `runCucumber_${newId()}`)
  await fs.mkdir(path.join(cwd, 'features'), { recursive: true })
  await fs.writeFile(
    path.join(cwd, 'features', 'test.feature'),
    reindent(`Feature: test fixture
      Scenario: one
        Given a step
        Then another step`)
  )
  await fs.writeFile(
    path.join(cwd, 'features', 'steps.ts'),
    reindent(`import { Given, Then } from '../../../src'
    Given('a step', function () {})
    Then('another step', function () {})`)
  )
  await fs.writeFile(
    path.join(cwd, 'cucumber.mjs'),
    `export default {paths: ['features/test.feature'], requireModule: ['ts-node/register'], require: ['features/steps.ts']}`
  )
  const stdout = new PassThrough()
  return { cwd, stdout }
}

async function teardownEnvironment(environment: IRunEnvironment) {
  await fs.rmdir(environment.cwd, { recursive: true })
  environment.stdout.end()
}

describe('runCucumber', () => {
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
