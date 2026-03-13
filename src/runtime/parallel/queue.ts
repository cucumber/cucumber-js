import { Pickle } from '@cucumber/messages'
import { AssembledTestCase } from '../../assemble'
import { ParallelAssignmentValidator } from '../../support_code_library_builder/types'

export class TestCaseQueue {
  private readonly items: Array<AssembledTestCase> = []

  constructor(private readonly canAssign: ParallelAssignmentValidator) {}

  get size() {
    return this.items.length
  }

  push(...newItems: Array<AssembledTestCase>) {
    this.items.push(...newItems)
  }

  shift(
    runningPickles: Array<Pickle>,
    force = false
  ): AssembledTestCase | undefined {
    for (const item of this.items) {
      if (force || this.canAssign(item.pickle, runningPickles)) {
        this.items.splice(this.items.indexOf(item), 1)
        return item
      }
    }
    return undefined
  }
}
