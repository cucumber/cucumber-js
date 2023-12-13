import * as messages from '@cucumber/messages'
import { expect } from 'chai'
import { atMostOnePicklePerTag } from './parallel_can_assign_helpers'

function pickleWithTags(tagNames: string[]): messages.Pickle {
  return {
    id: 'test',
    name: '',
    uri: '',
    steps: [],
    language: null,
    astNodeIds: [],
    tags: tagNames.map((tagName) => ({ name: tagName, astNodeId: null })),
  }
}

describe('parallel can assign helpers', () => {
  describe('atMostOnePicklePerTag()', () => {
    const testCanAssignFn = atMostOnePicklePerTag(['@complex', '@simple'])

    it('returns true if no pickles in progress', () => {
      // Arrange
      const inQuestion = pickleWithTags(['@complex'])
      const inProgress: messages.Pickle[] = []

      // Act
      const result = testCanAssignFn(inQuestion, inProgress)

      // Assert
      expect(result).to.eql(true)
    })

    it('returns true if pickle in question does not any of the given tags', () => {
      // Arrange
      const inQuestion = pickleWithTags([])
      const inProgress: messages.Pickle[] = [
        pickleWithTags(['@complex']),
        pickleWithTags(['@simple']),
      ]

      // Act
      const result = testCanAssignFn(inQuestion, inProgress)

      // Assert
      expect(result).to.eql(true)
    })

    it('returns true if pickle in question has one of the given tags but no other pickles in progress do', () => {
      // Arrange
      const inQuestion = pickleWithTags(['@complex'])
      const inProgress: messages.Pickle[] = [pickleWithTags(['@simple'])]

      // Act
      const result = testCanAssignFn(inQuestion, inProgress)

      // Assert
      expect(result).to.eql(true)
    })

    it('returns false if pickle in question has one of the given tags and a pickle in progress also has that tag', () => {
      // Arrange
      const inQuestion = pickleWithTags(['@complex'])
      const inProgress: messages.Pickle[] = [pickleWithTags(['@complex'])]

      // Act
      const result = testCanAssignFn(inQuestion, inProgress)

      // Assert
      expect(result).to.eql(false)
    })
  })
})
