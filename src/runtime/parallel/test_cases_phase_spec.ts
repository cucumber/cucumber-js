import type { Pickle } from '@cucumber/messages'
import { expect } from 'chai'
import { describe, it } from 'mocha'
import sinon from 'sinon'
import type { AssembledTestCase } from '../../assemble'
import type { ILogger } from '../../environment'
import type { ParallelAssignmentValidator } from '../../support_code_library_builder/types'
import { TestCasesPhase } from './test_cases_phase'

function makeLogger(): ILogger {
  return {
    debug: sinon.stub(),
    error: sinon.stub(),
    warn: sinon.stub(),
    info: sinon.stub(),
  }
}

function makeAssembledTestCase(id: string): AssembledTestCase {
  return {
    gherkinDocument: {} as AssembledTestCase['gherkinDocument'],
    pickle: { id } as Pickle,
    testCase: { id } as AssembledTestCase['testCase'],
  }
}

const canAssignAnything: ParallelAssignmentValidator = () => true

describe('TestCasesPhase', () => {
  // Regression test for a hang: when the phase starts with no test cases to run, no worker
  // is ever issued a command, so no FINISHED event ever arrives to trigger settlement via
  // `next()`. The phase must settle itself immediately instead of waiting forever.
  it('resolves successfully right away when there are no test cases to run', async () => {
    const logger = makeLogger()
    const result = await new Promise<boolean>((resolve, reject) => {
      const phase = new TestCasesPhase(resolve, reject, logger, canAssignAnything, [])
      // Simulate the adapter's startPhase(), which asks each worker to fill - none should
      // receive a command, and critically, none of this should cause a hang.
      expect(phase.fill()).to.be.undefined
    })
    expect(result).to.be.true
  })

  it('assigns queued test cases via fill() and settles once all have finished successfully', async () => {
    const logger = makeLogger()
    const testCaseA = makeAssembledTestCase('a')
    const testCaseB = makeAssembledTestCase('b')
    const result = new Promise<boolean>((resolve, reject) => {
      const phase = new TestCasesPhase(resolve, reject, logger, canAssignAnything, [
        testCaseA,
        testCaseB,
      ])
      const commandA = phase.fill()
      const commandB = phase.fill()
      expect(commandA?.assembledTestCase).to.equal(testCaseA)
      expect(commandB?.assembledTestCase).to.equal(testCaseB)
      expect(phase.next(commandA, { type: 'FINISHED', success: true })).to.be.undefined
      expect(phase.next(commandB, { type: 'FINISHED', success: true })).to.be.undefined
    })
    expect(await result).to.be.true
  })

  it('resolves unsuccessfully if any test case fails', async () => {
    const logger = makeLogger()
    const testCaseA = makeAssembledTestCase('a')
    const result = new Promise<boolean>((resolve, reject) => {
      const phase = new TestCasesPhase(resolve, reject, logger, canAssignAnything, [testCaseA])
      const commandA = phase.fill()
      phase.next(commandA, { type: 'FINISHED', success: false })
    })
    expect(await result).to.be.false
  })

  it('warns when all workers go idle before assigning remaining test cases', async () => {
    const logger = makeLogger()
    const canAssignNothing: ParallelAssignmentValidator = () => false
    const testCaseA = makeAssembledTestCase('a')
    const testCaseB = makeAssembledTestCase('b')
    const result = new Promise<boolean>((resolve, reject) => {
      const phase = new TestCasesPhase(resolve, reject, logger, canAssignNothing, [
        testCaseA,
        testCaseB,
      ])
      // `canAssign` never approves an assignment, so each test case can only be dequeued via
      // the idle-intervention fallback (once no workers are running anything).
      const commandA = phase.fill()
      const commandB = phase.next(commandA, { type: 'FINISHED', success: true })
      phase.next(commandB, { type: 'FINISHED', success: true })
    })
    expect(await result).to.be.true
    expect(logger.warn).to.have.been.calledOnce()
  })
})
