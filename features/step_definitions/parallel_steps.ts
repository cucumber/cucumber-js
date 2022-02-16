import { DataTable, Then } from '../../'
import { World } from '../support/world'
import messages from '@cucumber/messages'
import { expect } from 'chai'

function getSetsOfPicklesRunningAtTheSameTime(
  envelopes: messages.Envelope[]
): string[] {
  const pickleIdToName: Record<string, string> = {}
  const testCaseIdToPickleId: Record<string, string> = {}
  const testCaseStarteIdToPickleId: Record<string, string> = {}
  let currentRunningPickleIds: string[] = []
  const result: string[] = []
  envelopes.forEach((envelope) => {
    if (envelope.pickle != null) {
      pickleIdToName[envelope.pickle.id] = envelope.pickle.name
    } else if (envelope.testCase != null) {
      testCaseIdToPickleId[envelope.testCase.id] = envelope.testCase.pickleId
    } else if (envelope.testCaseStarted != null) {
      const pickleId = testCaseIdToPickleId[envelope.testCaseStarted.testCaseId]
      testCaseStarteIdToPickleId[envelope.testCaseStarted.id] = pickleId
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
        testCaseStarteIdToPickleId[envelope.testCaseFinished.testCaseStartedId]
      currentRunningPickleIds = currentRunningPickleIds.filter(
        (x) => x != pickleId
      )
    }
  })
  return result
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
