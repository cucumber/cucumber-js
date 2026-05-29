import path from 'node:path'
import { expect } from 'chai'
import { beforeEach, describe, it } from 'mocha'
import { parse } from '../test/gherkin_helpers'
import PickleFilter from './pickle_filter'

describe('PickleFilter', () => {
  const cwd = '/project'
  let pickleFilter: PickleFilter

  describe('matches', () => {
    describe('no filters', () => {
      beforeEach(() => {
        pickleFilter = new PickleFilter({
          cwd,
          featurePaths: ['features'],
          names: [],
          tagExpression: '',
        })
      })

      it('returns true', async () => {
        // Arrange
        const {
          pickles: [pickle],
          gherkinDocument,
        } = await parse({
          data: ['Feature: a', 'Scenario: b', 'Given a step'].join('\n'),
          uri: 'features/a.feature',
        })

        // Act
        const result = pickleFilter.matches({ pickle, gherkinDocument })

        // Assert
        expect(result).to.eql(true)
      })
    })

    describe('line filters', () => {
      const variants = [
        {
          name: 'with relative paths',
          featurePaths: ['features/a.feature', 'features/b.feature:2:4'],
        },
        {
          name: 'with absolute paths',
          featurePaths: [
            path.join(cwd, 'features/a.feature'),
            path.join(cwd, 'features/b.feature:2:4'),
          ],
        },
      ]

      variants.forEach(({ name, featurePaths }) => {
        describe(name, () => {
          beforeEach(() => {
            pickleFilter = new PickleFilter({
              cwd,
              featurePaths,
              names: [],
              tagExpression: '',
            })
          })

          describe('pickle in feature without line specified', () => {
            it('returns true', async () => {
              // Arrange
              const {
                pickles: [pickle],
                gherkinDocument,
              } = await parse({
                data: ['Feature: a', 'Scenario: b', 'Given a step'].join('\n'),
                uri: 'features/a.feature',
              })

              // Act
              const result = pickleFilter.matches({ pickle, gherkinDocument })

              // Assert
              expect(result).to.eql(true)
            })
          })

          describe('pickle in feature with line specified', () => {
            it('returns true if pickle line matches', async () => {
              // Arrange
              const {
                pickles: [pickle],
                gherkinDocument,
              } = await parse({
                data: ['Feature: a', 'Scenario: b', 'Given a step'].join('\n'),
                uri: 'features/b.feature',
              })

              // Act
              const result = pickleFilter.matches({ pickle, gherkinDocument })

              // Assert
              expect(result).to.eql(true)
            })

            it('returns false if pickle line does not match', async () => {
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
      })
    })

    describe('name filters', () => {
      describe('should match name A', () => {
        beforeEach(() => {
          pickleFilter = new PickleFilter({
            cwd,
            featurePaths: ['features'],
            names: ['nameA'],
            tagExpression: '',
          })
        })

        it('returns true if pickle name matches from scenario', async () => {
          // Arrange
          const {
            pickles: [pickle],
            gherkinDocument,
          } = await parse({
            data: ['Feature: a', 'Scenario: nameA descriptionA', 'Given a step'].join('\n'),
            uri: 'features/a.feature',
          })

          // Act
          const result = pickleFilter.matches({ pickle, gherkinDocument })

          // Assert
          expect(result).to.eql(true)
        })

        it('returns true if pickle name matches from rule -> example', async () => {
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
            uri: 'features/a.feature',
          })

          // Act
          const result = pickleFilter.matches({ pickle, gherkinDocument })

          // Assert
          expect(result).to.eql(true)
        })

        it('returns false if pickle name does not match', async () => {
          // Arrange
          const {
            pickles: [pickle],
            gherkinDocument,
          } = await parse({
            data: ['Feature: a', 'Scenario: nameB descriptionB', 'Given a step'].join('\n'),
            uri: 'features/a.feature',
          })

          // Act
          const result = pickleFilter.matches({ pickle, gherkinDocument })

          // Assert
          expect(result).to.eql(false)
        })
      })

      describe('should match name with regex', () => {
        beforeEach(() => {
          pickleFilter = new PickleFilter({
            cwd,
            featurePaths: ['features'],
            names: ['^startA.+endA$'],
            tagExpression: '',
          })
        })

        it('returns true if regex matches', async () => {
          // Arrange
          const {
            pickles: [pickle],
            gherkinDocument,
          } = await parse({
            data: ['Feature: a', 'Scenario: startA descriptionA endA', 'Given a step'].join('\n'),
            uri: 'features/a.feature',
          })

          // Act
          const result = pickleFilter.matches({ pickle, gherkinDocument })

          // Assert
          expect(result).to.eql(true)
        })
      })

      describe('should match name A or B', () => {
        beforeEach(() => {
          pickleFilter = new PickleFilter({
            cwd,
            featurePaths: ['features'],
            names: ['nameA', 'nameB'],
            tagExpression: '',
          })
        })

        it('returns true if pickle name matches A', async () => {
          // Arrange
          const {
            pickles: [pickle],
            gherkinDocument,
          } = await parse({
            data: ['Feature: a', 'Scenario: nameA descriptionA', 'Given a step'].join('\n'),
            uri: 'features/a.feature',
          })

          // Act
          const result = pickleFilter.matches({ pickle, gherkinDocument })

          // Assert
          expect(result).to.eql(true)
        })

        it('returns true if pickle name matches B', async () => {
          // Arrange
          const {
            pickles: [pickle],
            gherkinDocument,
          } = await parse({
            data: ['Feature: a', 'Scenario: nameB descriptionB', 'Given a step'].join('\n'),
            uri: 'features/a.feature',
          })

          // Act
          const result = pickleFilter.matches({ pickle, gherkinDocument })

          // Assert
          expect(result).to.eql(true)
        })

        it('returns false if pickle name does not match A nor B', async () => {
          // Arrange
          const {
            pickles: [pickle],
            gherkinDocument,
          } = await parse({
            data: ['Feature: a', 'Scenario: nameC descriptionC', 'Given a step'].join('\n'),
            uri: 'features/a.feature',
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
        beforeEach(() => {
          pickleFilter = new PickleFilter({
            cwd: cwd,
            featurePaths: ['features'],
            names: [],
            tagExpression: '@tagA',
          })
        })

        it('returns true if pickle has tag A', async () => {
          // Arrange
          const {
            pickles: [pickle],
            gherkinDocument,
          } = await parse({
            data: ['Feature: a', '@tagA', 'Scenario: a', 'Given a step'].join('\n'),
            uri: 'features/a.feature',
          })

          // Act
          const result = pickleFilter.matches({ pickle, gherkinDocument })

          // Assert
          expect(result).to.eql(true)
        })

        it('returns false if pickle does not have tag A', async () => {
          // Arrange
          const {
            pickles: [pickle],
            gherkinDocument,
          } = await parse({
            data: ['Feature: a', 'Scenario: a', 'Given a step'].join('\n'),
            uri: 'features/a.feature',
          })

          // Act
          const result = pickleFilter.matches({ pickle, gherkinDocument })

          // Assert
          expect(result).to.eql(false)
        })
      })

      describe('should not have tag A', () => {
        beforeEach(() => {
          pickleFilter = new PickleFilter({
            cwd,
            featurePaths: ['features'],
            names: [],
            tagExpression: 'not @tagA',
          })
        })

        it('returns false if pickle has tag A', async () => {
          // Arrange
          const {
            pickles: [pickle],
            gherkinDocument,
          } = await parse({
            data: ['Feature: a', '@tagA', 'Scenario: a', 'Given a step'].join('\n'),
            uri: 'features/a.feature',
          })

          // Act
          const result = pickleFilter.matches({ pickle, gherkinDocument })

          // Assert
          expect(result).to.eql(false)
        })

        it('returns true if pickle does not have tag A', async () => {
          // Arrange
          const {
            pickles: [pickle],
            gherkinDocument,
          } = await parse({
            data: ['Feature: a', 'Scenario: a', 'Given a step'].join('\n'),
            uri: 'features/a.feature',
          })

          // Act
          const result = pickleFilter.matches({ pickle, gherkinDocument })

          // Assert
          expect(result).to.eql(true)
        })
      })

      describe('should have tag A and B', () => {
        beforeEach(() => {
          pickleFilter = new PickleFilter({
            cwd,
            featurePaths: ['features'],
            names: [],
            tagExpression: '@tagA and @tagB',
          })
        })

        it('returns true if pickle has tag A and B', async () => {
          // Arrange
          const {
            pickles: [pickle],
            gherkinDocument,
          } = await parse({
            data: ['Feature: a', '@tagA @tagB', 'Scenario: a', 'Given a step'].join('\n'),
            uri: 'features/a.feature',
          })

          // Act
          const result = pickleFilter.matches({ pickle, gherkinDocument })

          // Assert
          expect(result).to.eql(true)
        })

        it('returns false if pickle has tag A but not B', async () => {
          // Arrange
          const {
            pickles: [pickle],
            gherkinDocument,
          } = await parse({
            data: ['Feature: a', '@tagA', 'Scenario: a', 'Given a step'].join('\n'),
            uri: 'features/a.feature',
          })

          // Act
          const result = pickleFilter.matches({ pickle, gherkinDocument })

          // Assert
          expect(result).to.eql(false)
        })

        it('returns false if pickle has tag B but not A', async () => {
          // Arrange
          const {
            pickles: [pickle],
            gherkinDocument,
          } = await parse({
            data: ['Feature: a', '@tagB', 'Scenario: a', 'Given a step'].join('\n'),
            uri: 'features/a.feature',
          })

          // Act
          const result = pickleFilter.matches({ pickle, gherkinDocument })

          // Assert
          expect(result).to.eql(false)
        })

        it('returns false if pickle has neither tag A nor B', async () => {
          // Arrange
          const {
            pickles: [pickle],
            gherkinDocument,
          } = await parse({
            data: ['Feature: a', 'Scenario: a', 'Given a step'].join('\n'),
            uri: 'features/a.feature',
          })

          // Act
          const result = pickleFilter.matches({ pickle, gherkinDocument })

          // Assert
          expect(result).to.eql(false)
        })
      })

      describe('should have tag A or B', () => {
        beforeEach(() => {
          pickleFilter = new PickleFilter({
            cwd: cwd,
            featurePaths: ['features'],
            names: [],
            tagExpression: '@tagA or @tagB',
          })
        })

        it('returns true if pickle has tag A and B', async () => {
          // Arrange
          const {
            pickles: [pickle],
            gherkinDocument,
          } = await parse({
            data: ['Feature: a', '@tagA @tagB', 'Scenario: a', 'Given a step'].join('\n'),
            uri: 'features/a.feature',
          })

          // Act
          const result = pickleFilter.matches({ pickle, gherkinDocument })

          // Assert
          expect(result).to.eql(true)
        })

        it('returns true if pickle has tag A but not B', async () => {
          // Arrange
          const {
            pickles: [pickle],
            gherkinDocument,
          } = await parse({
            data: ['Feature: a', '@tagA', 'Scenario: a', 'Given a step'].join('\n'),
            uri: 'features/a.feature',
          })

          // Act
          const result = pickleFilter.matches({ pickle, gherkinDocument })

          // Assert
          expect(result).to.eql(true)
        })

        it('returns true if pickle has tag B but not A', async () => {
          // Arrange
          const {
            pickles: [pickle],
            gherkinDocument,
          } = await parse({
            data: ['Feature: a', '@tagB', 'Scenario: a', 'Given a step'].join('\n'),
            uri: 'features/a.feature',
          })

          // Act
          const result = pickleFilter.matches({ pickle, gherkinDocument })

          // Assert
          expect(result).to.eql(true)
        })

        it('returns false if pickle has neither tag A nor B', async () => {
          // Arrange
          const {
            pickles: [pickle],
            gherkinDocument,
          } = await parse({
            data: ['Feature: a', 'Scenario: a', 'Given a step'].join('\n'),
            uri: 'features/a.feature',
          })

          // Act
          const result = pickleFilter.matches({ pickle, gherkinDocument })

          // Assert
          expect(result).to.eql(false)
        })
      })
    })

    describe('line, name, and tag filters', () => {
      beforeEach(() => {
        pickleFilter = new PickleFilter({
          cwd: cwd,
          featurePaths: ['features/b.feature:3'],
          names: ['nameA'],
          tagExpression: '@tagA',
        })
      })

      it('returns true if pickle matches all filters', async () => {
        // Arrange
        const {
          pickles: [pickle],
          gherkinDocument,
        } = await parse({
          data: ['Feature: a', '@tagA', 'Scenario: nameA descriptionA', 'Given a step'].join('\n'),
          uri: 'features/b.feature',
        })

        // Act
        const result = pickleFilter.matches({ pickle, gherkinDocument })

        // Assert
        expect(result).to.eql(true)
      })

      it('returns false if pickle matches some filters but not others', async () => {
        // Arrange
        const {
          pickles: [pickle],
          gherkinDocument,
        } = await parse({
          data: ['Feature: a', '', 'Scenario: nameA descriptionA', 'Given a step'].join('\n'),
          uri: 'features/b.feature',
        })

        // Act
        const result = pickleFilter.matches({ pickle, gherkinDocument })

        // Assert
        expect(result).to.eql(false)
      })

      it('returns false if pickle matches no filters', async () => {
        // Arrange
        const {
          pickles: [pickle],
          gherkinDocument,
        } = await parse({
          data: ['Feature: a', 'Scenario: a', 'Given a step'].join('\n'),
          uri: 'features/a.feature',
        })

        // Act
        const result = pickleFilter.matches({ pickle, gherkinDocument })

        // Assert
        expect(result).to.eql(false)
      })
    })
  })
})
