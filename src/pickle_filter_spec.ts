import { beforeEach, describe, it } from 'mocha'
import { expect } from 'chai'
import PickleFilter from './pickle_filter'
import path from 'path'
import { parse } from '../test/gherkin_helpers'

describe('PickleFilter', () => {
  const cwd = '/project'
  let pickleFilter: PickleFilter

  describe('matches', () => {
    describe('no filters', () => {
      beforeEach(function () {
        pickleFilter = new PickleFilter({
          cwd,
          featurePaths: ['features'],
          names: [],
          tagExpression: '',
        })
      })

      it('returns true', async function () {
        // Arrange
        const {
          pickles: [pickle],
          gherkinDocument,
        } = await parse({
          data: ['Feature: a', 'Scenario: b', 'Given a step'].join('\n'),
          uri: path.resolve(cwd, 'features/a.feature'),
        })

        // Act
        const result = pickleFilter.matches({ pickle, gherkinDocument })

        // Assert
        expect(result).to.eql(true)
      })
    })

    describe('line filters', () => {
      beforeEach(function () {
        pickleFilter = new PickleFilter({
          cwd,
          featurePaths: ['features/a.feature', 'features/b.feature:2:4'],
          names: [],
          tagExpression: '',
        })
      })

      describe('pickle in feature without line specified', () => {
        it('returns true', async function () {
          // Arrange
          const {
            pickles: [pickle],
            gherkinDocument,
          } = await parse({
            data: ['Feature: a', 'Scenario: b', 'Given a step'].join('\n'),
            uri: path.resolve(cwd, 'features/a.feature'),
          })

          // Act
          const result = pickleFilter.matches({ pickle, gherkinDocument })

          // Assert
          expect(result).to.eql(true)
        })
      })

      describe('pickle in feature with line specified', () => {
        it('returns true if pickle line matches', async function () {
          // Arrange
          const {
            pickles: [pickle],
            gherkinDocument,
          } = await parse({
            data: ['Feature: a', 'Scenario: b', 'Given a step'].join('\n'),
            uri: path.resolve(cwd, 'features/b.feature'),
          })

          // Act
          const result = pickleFilter.matches({ pickle, gherkinDocument })

          // Assert
          expect(result).to.eql(true)
        })

        it('returns true if pickle line does not match', async function () {
          // Arrange
          const {
            pickles: [pickle],
            gherkinDocument,
          } = await parse({
            data: ['Feature: a', '', 'Scenario: b', 'Given a step'].join('\n'),
            uri: 'features/b.feature',
          })

          // Act
          const result = pickleFilter.matches({ pickle, gherkinDocument })

          // Assert
          expect(result).to.eql(false)
        })
      })
    })

    describe('name filters', () => {
      describe('should match name A', () => {
        beforeEach(function () {
          pickleFilter = new PickleFilter({
            cwd,
            featurePaths: ['features'],
            names: ['nameA'],
            tagExpression: '',
          })
        })

        it('returns true if pickle name matches from scenario', async function () {
          // Arrange
          const {
            pickles: [pickle],
            gherkinDocument,
          } = await parse({
            data: [
              'Feature: a',
              'Scenario: nameA descriptionA',
              'Given a step',
            ].join('\n'),
            uri: path.resolve(cwd, 'features/a.feature'),
          })

          // Act
          const result = pickleFilter.matches({ pickle, gherkinDocument })

          // Assert
          expect(result).to.eql(true)
        })

        it('returns true if pickle name matches from rule -> example', async function () {
          // Arrange
          const {
            pickles: [pickle],
            gherkinDocument,
          } = await parse({
            data: [
              'Feature: a',
              'Rule: nameR descriptionR',
              'Example: nameA descriptionA',
              'Given a step',
            ].join('\n'),
            uri: path.resolve(cwd, 'features/a.feature'),
          })

          // Act
          const result = pickleFilter.matches({ pickle, gherkinDocument })

          // Assert
          expect(result).to.eql(true)
        })

        it('returns false if pickle name does not match', async function () {
          // Arrange
          const {
            pickles: [pickle],
            gherkinDocument,
          } = await parse({
            data: [
              'Feature: a',
              'Scenario: nameB descriptionB',
              'Given a step',
            ].join('\n'),
            uri: path.resolve(cwd, 'features/a.feature'),
          })

          // Act
          const result = pickleFilter.matches({ pickle, gherkinDocument })

          // Assert
          expect(result).to.eql(false)
        })
      })

      describe('should match name with regex', () => {
        beforeEach(function () {
          pickleFilter = new PickleFilter({
            cwd,
            featurePaths: ['features'],
            names: ['^startA.+endA$'],
            tagExpression: '',
          })
        })

        it('returns true if regex matches', async function () {
          // Arrange
          const {
            pickles: [pickle],
            gherkinDocument,
          } = await parse({
            data: [
              'Feature: a',
              'Scenario: startA descriptionA endA',
              'Given a step',
            ].join('\n'),
            uri: path.resolve(cwd, 'features/a.feature'),
          })

          // Act
          const result = pickleFilter.matches({ pickle, gherkinDocument })

          // Assert
          expect(result).to.eql(true)
        })
      })

      describe('should match name A or B', () => {
        beforeEach(function () {
          pickleFilter = new PickleFilter({
            cwd,
            featurePaths: ['features'],
            names: ['nameA', 'nameB'],
            tagExpression: '',
          })
        })

        it('returns true if pickle name matches A', async function () {
          // Arrange
          const {
            pickles: [pickle],
            gherkinDocument,
          } = await parse({
            data: [
              'Feature: a',
              'Scenario: nameA descriptionA',
              'Given a step',
            ].join('\n'),
            uri: path.resolve(cwd, 'features/a.feature'),
          })

          // Act
          const result = pickleFilter.matches({ pickle, gherkinDocument })

          // Assert
          expect(result).to.eql(true)
        })

        it('returns true if pickle name matches B', async function () {
          // Arrange
          const {
            pickles: [pickle],
            gherkinDocument,
          } = await parse({
            data: [
              'Feature: a',
              'Scenario: nameB descriptionB',
              'Given a step',
            ].join('\n'),
            uri: path.resolve(cwd, 'features/a.feature'),
          })

          // Act
          const result = pickleFilter.matches({ pickle, gherkinDocument })

          // Assert
          expect(result).to.eql(true)
        })

        it('returns false if pickle name does not match A nor B', async function () {
          // Arrange
          const {
            pickles: [pickle],
            gherkinDocument,
          } = await parse({
            data: [
              'Feature: a',
              'Scenario: nameC descriptionC',
              'Given a step',
            ].join('\n'),
            uri: path.resolve(cwd, 'features/a.feature'),
          })

          // Act
          const result = pickleFilter.matches({ pickle, gherkinDocument })

          // Assert
          expect(result).to.eql(false)
        })
      })
    })

    describe('tag filters', () => {
      describe('should have tag A', () => {
        beforeEach(function () {
          pickleFilter = new PickleFilter({
            cwd: cwd,
            featurePaths: ['features'],
            names: [],
            tagExpression: '@tagA',
          })
        })

        it('returns true if pickle has tag A', async function () {
          // Arrange
          const {
            pickles: [pickle],
            gherkinDocument,
          } = await parse({
            data: ['Feature: a', '@tagA', 'Scenario: a', 'Given a step'].join(
              '\n'
            ),
            uri: path.resolve(cwd, 'features/a.feature'),
          })

          // Act
          const result = pickleFilter.matches({ pickle, gherkinDocument })

          // Assert
          expect(result).to.eql(true)
        })

        it('returns false if pickle does not have tag A', async function () {
          // Arrange
          const {
            pickles: [pickle],
            gherkinDocument,
          } = await parse({
            data: ['Feature: a', 'Scenario: a', 'Given a step'].join('\n'),
            uri: path.resolve(cwd, 'features/a.feature'),
          })

          // Act
          const result = pickleFilter.matches({ pickle, gherkinDocument })

          // Assert
          expect(result).to.eql(false)
        })
      })

      describe('should not have tag A', () => {
        beforeEach(function () {
          pickleFilter = new PickleFilter({
            cwd,
            featurePaths: ['features'],
            names: [],
            tagExpression: 'not @tagA',
          })
        })

        it('returns false if pickle has tag A', async function () {
          // Arrange
          const {
            pickles: [pickle],
            gherkinDocument,
          } = await parse({
            data: ['Feature: a', '@tagA', 'Scenario: a', 'Given a step'].join(
              '\n'
            ),
            uri: path.resolve(cwd, 'features/a.feature'),
          })

          // Act
          const result = pickleFilter.matches({ pickle, gherkinDocument })

          // Assert
          expect(result).to.eql(false)
        })

        it('returns true if pickle does not have tag A', async function () {
          // Arrange
          const {
            pickles: [pickle],
            gherkinDocument,
          } = await parse({
            data: ['Feature: a', 'Scenario: a', 'Given a step'].join('\n'),
            uri: path.resolve(cwd, 'features/a.feature'),
          })

          // Act
          const result = pickleFilter.matches({ pickle, gherkinDocument })

          // Assert
          expect(result).to.eql(true)
        })
      })

      describe('should have tag A and B', () => {
        beforeEach(function () {
          pickleFilter = new PickleFilter({
            cwd,
            featurePaths: ['features'],
            names: [],
            tagExpression: '@tagA and @tagB',
          })
        })

        it('returns true if pickle has tag A and B', async function () {
          // Arrange
          const {
            pickles: [pickle],
            gherkinDocument,
          } = await parse({
            data: [
              'Feature: a',
              '@tagA @tagB',
              'Scenario: a',
              'Given a step',
            ].join('\n'),
            uri: path.resolve(cwd, 'features/a.feature'),
          })

          // Act
          const result = pickleFilter.matches({ pickle, gherkinDocument })

          // Assert
          expect(result).to.eql(true)
        })

        it('returns false if pickle has tag A but not B', async function () {
          // Arrange
          const {
            pickles: [pickle],
            gherkinDocument,
          } = await parse({
            data: ['Feature: a', '@tagA', 'Scenario: a', 'Given a step'].join(
              '\n'
            ),
            uri: path.resolve(cwd, 'features/a.feature'),
          })

          // Act
          const result = pickleFilter.matches({ pickle, gherkinDocument })

          // Assert
          expect(result).to.eql(false)
        })

        it('returns false if pickle has tag B but not A', async function () {
          // Arrange
          const {
            pickles: [pickle],
            gherkinDocument,
          } = await parse({
            data: ['Feature: a', '@tagB', 'Scenario: a', 'Given a step'].join(
              '\n'
            ),
            uri: path.resolve(cwd, 'features/a.feature'),
          })

          // Act
          const result = pickleFilter.matches({ pickle, gherkinDocument })

          // Assert
          expect(result).to.eql(false)
        })

        it('returns false if pickle has neither tag A nor B', async function () {
          // Arrange
          const {
            pickles: [pickle],
            gherkinDocument,
          } = await parse({
            data: ['Feature: a', 'Scenario: a', 'Given a step'].join('\n'),
            uri: path.resolve(cwd, 'features/a.feature'),
          })

          // Act
          const result = pickleFilter.matches({ pickle, gherkinDocument })

          // Assert
          expect(result).to.eql(false)
        })
      })

      describe('should have tag A or B', () => {
        beforeEach(function () {
          pickleFilter = new PickleFilter({
            cwd: cwd,
            featurePaths: ['features'],
            names: [],
            tagExpression: '@tagA or @tagB',
          })
        })

        it('returns true if pickle has tag A and B', async function () {
          // Arrange
          const {
            pickles: [pickle],
            gherkinDocument,
          } = await parse({
            data: [
              'Feature: a',
              '@tagA @tagB',
              'Scenario: a',
              'Given a step',
            ].join('\n'),
            uri: path.resolve(cwd, 'features/a.feature'),
          })

          // Act
          const result = pickleFilter.matches({ pickle, gherkinDocument })

          // Assert
          expect(result).to.eql(true)
        })

        it('returns true if pickle has tag A but not B', async function () {
          // Arrange
          const {
            pickles: [pickle],
            gherkinDocument,
          } = await parse({
            data: ['Feature: a', '@tagA', 'Scenario: a', 'Given a step'].join(
              '\n'
            ),
            uri: path.resolve(cwd, 'features/a.feature'),
          })

          // Act
          const result = pickleFilter.matches({ pickle, gherkinDocument })

          // Assert
          expect(result).to.eql(true)
        })

        it('returns true if pickle has tag B but not A', async function () {
          // Arrange
          const {
            pickles: [pickle],
            gherkinDocument,
          } = await parse({
            data: ['Feature: a', '@tagB', 'Scenario: a', 'Given a step'].join(
              '\n'
            ),
            uri: path.resolve(cwd, 'features/a.feature'),
          })

          // Act
          const result = pickleFilter.matches({ pickle, gherkinDocument })

          // Assert
          expect(result).to.eql(true)
        })

        it('returns false if pickle has neither tag A nor B', async function () {
          // Arrange
          const {
            pickles: [pickle],
            gherkinDocument,
          } = await parse({
            data: ['Feature: a', 'Scenario: a', 'Given a step'].join('\n'),
            uri: path.resolve(cwd, 'features/a.feature'),
          })

          // Act
          const result = pickleFilter.matches({ pickle, gherkinDocument })

          // Assert
          expect(result).to.eql(false)
        })
      })
    })

    describe('line, name, and tag filters', () => {
      beforeEach(function () {
        pickleFilter = new PickleFilter({
          cwd: cwd,
          featurePaths: ['features/b.feature:3'],
          names: ['nameA'],
          tagExpression: '@tagA',
        })
      })

      it('returns true if pickle matches all filters', async function () {
        // Arrange
        const {
          pickles: [pickle],
          gherkinDocument,
        } = await parse({
          data: [
            'Feature: a',
            '@tagA',
            'Scenario: nameA descriptionA',
            'Given a step',
          ].join('\n'),
          uri: path.resolve(cwd, 'features/b.feature'),
        })

        // Act
        const result = pickleFilter.matches({ pickle, gherkinDocument })

        // Assert
        expect(result).to.eql(true)
      })

      it('returns false if pickle matches some filters but not others', async function () {
        // Arrange
        const {
          pickles: [pickle],
          gherkinDocument,
        } = await parse({
          data: [
            'Feature: a',
            '',
            'Scenario: nameA descriptionA',
            'Given a step',
          ].join('\n'),
          uri: path.resolve(cwd, 'features/b.feature'),
        })

        // Act
        const result = pickleFilter.matches({ pickle, gherkinDocument })

        // Assert
        expect(result).to.eql(false)
      })

      it('returns false if pickle matches no filters', async function () {
        // Arrange
        const {
          pickles: [pickle],
          gherkinDocument,
        } = await parse({
          data: ['Feature: a', 'Scenario: a', 'Given a step'].join('\n'),
          uri: path.resolve(cwd, 'features/a.feature'),
        })

        // Act
        const result = pickleFilter.matches({ pickle, gherkinDocument })

        // Assert
        expect(result).to.eql(false)
      })
    })
  })
})
