import type { Pickle } from '@cucumber/messages'
import type { ParallelAssignmentValidator } from './types'

function hasTag(pickle: Pickle, tagName: string): boolean {
  return pickle.tags.some((t) => t.name === tagName)
}

export function atMostOnePicklePerTag(tagNames: string[]): ParallelAssignmentValidator {
  return (inQuestion: Pickle, inProgress: Pickle[]) => {
    return tagNames.every((tagName) => {
      return !hasTag(inQuestion, tagName) || inProgress.every((p) => !hasTag(p, tagName))
    })
  }
}
