import { IdGenerator, messages } from '@cucumber/messages'
import { ISupportCodeLibrary } from '../support_code_library_builder/types'
import { EventEmitter } from 'events'
import {
  assembleTestCases,
  IAssembledTestCasesMap,
} from './assemble_test_cases'
import { afterEach, beforeEach, describe } from 'mocha'
import FakeTimers, { InstalledClock } from '@sinonjs/fake-timers'
import timeMethods from '../time'
import { buildSupportCodeLibrary } from '../../test/runtime_helpers'
import { parse } from '../../test/gherkin_helpers'
import { expect } from 'chai'

interface IRequest {
  gherkinDocument: messages.IGherkinDocument
  pickles: messages.IPickle[]
  supportCodeLibrary: ISupportCodeLibrary
}

interface IResponse {
  envelopes: messages.IEnvelope[]
  result: IAssembledTestCasesMap
}

async function testAssembleTestCases(options: IRequest): Promise<IResponse> {
  const envelopes: messages.IEnvelope[] = []
  const eventBroadcaster = new EventEmitter()
  eventBroadcaster.on('envelope', (e) => envelopes.push(e))
  const result = await assembleTestCases({
    eventBroadcaster,
    newId: IdGenerator.incrementing(),
    pickles: options.pickles,
    supportCodeLibrary: options.supportCodeLibrary,
  })
  return { envelopes, result }
}

describe('PickleRunner', () => {
  let clock: InstalledClock

  beforeEach(() => {
    clock = FakeTimers.withGlobal(timeMethods).install()
  })

  afterEach(() => {
    clock.uninstall()
  })

  describe('assembleTestCases()', () => {
    it('emits testCase messages', async () => {
      // Arrange
      const supportCodeLibrary = buildSupportCodeLibrary(({ Given }) => {
        Given('a step', function () {
          clock.tick(1)
        })
      })
      const { gherkinDocument, pickles } = await parse({
        data: [
          'Feature: a',
          'Scenario: b',
          'Given a step',
          'Scenario: c',
          'Given a step',
        ].join('\n'),
        uri: 'a.feature',
      })

      // Act
      const { envelopes } = await testAssembleTestCases({
        gherkinDocument,
        pickles,
        supportCodeLibrary,
      })

      // Assert
      expect(envelopes).to.eql([
        messages.Envelope.fromObject({
          testCase: {
            id: '0',
            pickleId: pickles[0].id,
            testSteps: [
              {
                id: '1',
                pickleStepId: pickles[0].steps[0].id,
                stepDefinitionIds: [supportCodeLibrary.stepDefinitions[0].id],
                stepMatchArgumentsLists: [
                  {
                    stepMatchArguments: [],
                  },
                ],
              },
            ],
          },
        }),
        messages.Envelope.fromObject({
          testCase: {
            id: '2',
            pickleId: pickles[1].id,
            testSteps: [
              {
                id: '3',
                pickleStepId: pickles[1].steps[0].id,
                stepDefinitionIds: [supportCodeLibrary.stepDefinitions[0].id],
                stepMatchArgumentsLists: [
                  {
                    stepMatchArguments: [],
                  },
                ],
              },
            ],
          },
        }),
      ])

      // TODO assert on result map
    })
  })
})
