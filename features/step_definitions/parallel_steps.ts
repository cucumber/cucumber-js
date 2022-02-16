import { DataTable, Then } from '../../'
import { World } from '../support/world'
import messages from '@cucumber/messages'
import { expect } from 'chai'

function getPairsOfPicklesRunningAtTheSameTime(
  envelopes: messages.Envelope[]
): string[][] {
  const pickleIdToName: Record<string, string> = {}
  const testCaseIdToPickleId: Record<string, string> = {}
  const testCaseStarteIdToPickleId: Record<string, string> = {}
  let currentRunningPickleIds: string[] = []
  const result: string[][] = []
  envelopes.forEach((envelope) => {
    if (envelope.pickle != null) {
      pickleIdToName[envelope.pickle.id] = envelope.pickle.name
    } else if (envelope.testCase != null) {
      testCaseIdToPickleId[envelope.testCase.id] = envelope.testCase.pickleId
    } else if (envelope.testCaseStarted != null) {
      const pickleId = testCaseIdToPickleId[envelope.testCaseStarted.testCaseId]
      testCaseStarteIdToPickleId[envelope.testCaseStarted.id] = pickleId
      currentRunningPickleIds.forEach((x) => {
        result.push([pickleIdToName[x], pickleIdToName[pickleId]])
      })
      currentRunningPickleIds.push(pickleId)
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
  const actualPairs = getPairsOfPicklesRunningAtTheSameTime(
    this.lastRun.envelopes
  )
  expect(actualPairs).to.eql([])
})

Then(
  'the following pairs of pickles execute at the same time:',
  function (this: World, dataTable: DataTable) {
    const expectedPairs = dataTable.raw()
    const actualPairs = getPairsOfPicklesRunningAtTheSameTime(
      this.lastRun.envelopes
    )
    expect(actualPairs).to.eql(expectedPairs)
  }
)
