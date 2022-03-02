import { Envelope, TestStepResultStatus, IdGenerator } from '@cucumber/messages'
import fs from 'mz/fs'
import path from 'path'
import { reindent } from 'reindent-template-literals'
import { PassThrough } from 'stream'
import { expect } from 'chai'
import { IUserConfiguration } from '../configuration'
import { runCucumber } from './runCucumber'
import { IRunEnvironment } from './types'
import { loadSupport } from './loadSupport'

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
  const stdout = new PassThrough()
  return { cwd, stdout }
}

async function teardownEnvironment(environment: Partial<IRunEnvironment>) {
  await fs.rmdir(environment.cwd, { recursive: true })
  environment.stdout.end()
}

describe('runCucumber', () => {
  describe('preloading support code', () => {
    let environment: Partial<IRunEnvironment>
    beforeEach(async () => {
      environment = await setupEnvironment()
    })
    afterEach(async () => teardownEnvironment(environment))

    it('should be able to load support code upfront and supply it to runCucumber', async () => {
      const messages: Envelope[] = []
      const configuration: IUserConfiguration = {
        sources: {
          paths: ['features/test.feature'],
        },
        support: {
          requireModules: ['ts-node/register'],
          requirePaths: ['features/steps.ts'],
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
    let environment: Partial<IRunEnvironment>
    beforeEach(async () => {
      environment = await setupEnvironment()
    })
    afterEach(async () => teardownEnvironment(environment))

    it('successfully executes 2 test runs', async () => {
      const messages: Envelope[] = []
      const configuration: IUserConfiguration = {
        sources: {
          paths: ['features/test.feature'],
        },
        support: {
          requireModules: ['ts-node/register'],
          requirePaths: ['features/steps.ts'],
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
