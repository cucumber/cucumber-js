import messages from '@cucumber/messages'
import { expect } from 'chai'
import { DataTable, Then } from '../../'
import { World } from '../support/world'

function getSetsOfPicklesRunningAtTheSameTime(
  envelopes: messages.Envelope[]
): string[] {
  const pickleIdToName: Record<string, string> = {}
  const testCaseIdToPickleId: Record<string, string> = {}
  const testCaseStartedIdToPickleId: Record<string, string> = {}
  let currentRunningPickleIds: string[] = []
  const result: string[] = []
  envelopes.forEach((envelope) => {
    if (envelope.pickle != null) {
      pickleIdToName[envelope.pickle.id] = envelope.pickle.name
    } else if (envelope.testCase != null) {
      testCaseIdToPickleId[envelope.testCase.id] = envelope.testCase.pickleId
    } else if (envelope.testCaseStarted != null) {
      const pickleId = testCaseIdToPickleId[envelope.testCaseStarted.testCaseId]
      testCaseStartedIdToPickleId[envelope.testCaseStarted.id] = pickleId
      currentRunningPickleIds.push(pickleId)
      if (currentRunningPickleIds.length > 1) {
        const setOfPickleNames = currentRunningPickleIds
          .map((x) => pickleIdToName[x])
          .sort()
          .join(', ')
        result.push(setOfPickleNames)
      }
    } else if (envelope.testCaseFinished != null) {
      const pickleId =
        testCaseStartedIdToPickleId[envelope.testCaseFinished.testCaseStartedId]
      currentRunningPickleIds = currentRunningPickleIds.filter(
        (x) => x != pickleId
      )
    }
  })
  return result
}

/**
 * Returns any failed {@link message.TestCaseFinished} events that failed and will be retried.
 * @param envelopes The total envelopes for the run.
 * @param scenarioName The name of the scenario to gether events for.
 * @returns The events that indicate a particular step failed and was retried.
 */
function getRetriesForScenario(
  envelopes: messages.Envelope[],
  scenarioName: string
) {
  const scenarioEnvelope = envelopes.find(
    (envelope) => envelope.pickle?.name === scenarioName
  )

  if (scenarioEnvelope === undefined) {
    throw new Error('Could not find scenario: ' + scenarioEnvelope)
  }

  const scenarioPickle = scenarioEnvelope.pickle!
  const testCase = envelopes.find(
    (env) => env.testCase?.pickleId === scenarioPickle.id
  )?.testCase

  if (testCase === undefined) {
    throw new Error('Could not find test case for scenario: ' + scenarioName)
  }

  const scenarioCasesStarted = envelopes.filter(
    (envelope) => envelope.testCaseStarted?.testCaseId === testCase.id
  )
  const testStartedIds = scenarioCasesStarted.map(
    (started) => started.testCaseStarted.id
  )
  const scenarioCasesFinished = envelopes.filter((envelope) => {
    if (envelope.testCaseFinished?.testCaseStartedId) {
      return testStartedIds.includes(
        envelope.testCaseFinished.testCaseStartedId
      )
    }
    return false
  })

  return scenarioCasesFinished.filter(
    (testCaseFinished) =>
      testCaseFinished.testCaseFinished.willBeRetried === true
  )
}

Then('no pickles run at the same time', function (this: World) {
  const actualSets = getSetsOfPicklesRunningAtTheSameTime(
    this.lastRun.envelopes
  )
  expect(actualSets).to.eql([])
})

Then(
  'the following sets of pickles execute at the same time:',
  function (this: World, dataTable: DataTable) {
    const expectedSets = dataTable.raw().map((row) => row[0])
    const actualSets = getSetsOfPicklesRunningAtTheSameTime(
      this.lastRun.envelopes
    )
    expect(actualSets).to.eql(expectedSets)
  }
)

Then('`testCaseStarted` envelope has `workerId`', function (this: World) {
  const testCaseStartedEnvelope = this.lastRun.envelopes.find(
    (envelope) => envelope.testCaseStarted
  )

  expect(testCaseStartedEnvelope.testCaseStarted).to.ownProperty('workerId')
})

Then(
  'the scenario {string} retried {int} times',
  function (this: World, scenarioName: string, retryCount: number) {
    const retried = getRetriesForScenario(this.lastRun.envelopes, scenarioName)
    expect(retried).to.have.lengthOf(retryCount)
  }
)

Then(
  'the first two scenarios run in parallel while the last runs sequentially',
  function (this: World) {
    const sets = getSetsOfPicklesRunningAtTheSameTime(this.lastRun.envelopes)

    expect(Array.from(new Set(sets).values())).to.eql([
      'fail_parallel, pass_parallel',
    ])
  }
)
