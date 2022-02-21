import * as messages from '@cucumber/messages'
import { ParallelAssignmentValidator } from './types'

function hasTag(pickle: messages.Pickle, tagName: string): boolean {
  return pickle.tags.some((t) => t.name == tagName)
}

export function atMostOnePicklePerTag(
  tagNames: string[]
): ParallelAssignmentValidator {
  return (inQuestion: messages.Pickle, inProgress: messages.Pickle[]) => {
    return tagNames.every((tagName) => {
      return (
        !hasTag(inQuestion, tagName) ||
        inProgress.every((p) => !hasTag(p, tagName))
      )
    })
  }
}
