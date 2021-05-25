import { afterEach, beforeEach, describe, it } from 'mocha'
import { expect } from 'chai'
import { testFormatter } from '../../test/formatter_helpers'
import {
  getJsonFormatterSupportCodeLibrary,
  getJsonFormatterSupportCodeLibraryWithHooks,
} from '../../test/fixtures/json_formatter_steps'
import FakeTimers, { InstalledClock } from '@sinonjs/fake-timers'
import timeMethods from '../time'
import { IJsonFeature, IJsonScenario } from '../../lib/formatter/json_formatter'

describe('JsonFormatter', () => {
  let clock: InstalledClock

  beforeEach(() => {
    clock = FakeTimers.withGlobal(timeMethods).install()
  })

  afterEach(() => {
    clock.uninstall()
  })

  describe('no features', () => {
    it('outputs an empty array', async () => {
      // Arrange

      // Act
      const output = await testFormatter({ type: 'json' })

      // Assert
      expect(JSON.parse(output)).to.eql([])
    })
  })

  describe('one scenario with one step', () => {
    describe('passed', () => {
      it('outputs the feature', async () => {
        // Arrange
        const sources = [
          {
            data: [
              '@tag1 @tag2',
              'Feature: my feature',
              '  my feature description',
              '',
              '  Scenario: my scenario',
              '    my scenario description',
              '',
              '    Given a passing step',
            ].join('\n'),
            uri: 'a.feature',
          },
        ]

        const supportCodeLibrary = getJsonFormatterSupportCodeLibrary(clock)

        // Act
        const output = await testFormatter({
          sources,
          supportCodeLibrary,
          type: 'json',
        })

        // Assert
        expect(JSON.parse(output)).to.eql([
          {
            description: '  my feature description',
            elements: [
              {
                description: '    my scenario description',
                id: 'my-feature;my-scenario',
                keyword: 'Scenario',
                line: 5,
                name: 'my scenario',
                type: 'scenario',
                steps: [
                  {
                    arguments: [],
                    line: 8,
                    match: {
                      location: 'json_formatter_steps.ts:12',
                    },
                    keyword: 'Given ',
                    name: 'a passing step',
                    result: {
                      status: 'passed',
                      duration: 1000000,
                    },
                  },
                ],
                tags: [
                  { name: '@tag1', line: 1 },
                  { name: '@tag2', line: 1 },
                ],
              },
            ],
            id: 'my-feature',
            keyword: 'Feature',
            line: 2,
            name: 'my feature',
            tags: [
              { name: '@tag1', line: 1 },
              { name: '@tag2', line: 1 },
            ],
            uri: 'a.feature',
          },
        ])
      })
    })

    describe('retried', () => {
      it('only outputs the last attempt', async () => {
        // Arrange
        const sources = [
          {
            data: [
              'Feature: my feature',
              '  Scenario: my scenario',
              '    Given a flaky step',
            ].join('\n'),
            uri: 'a.feature',
          },
        ]

        const supportCodeLibrary = getJsonFormatterSupportCodeLibrary(clock)

        // Act
        const output = await testFormatter({
          runtimeOptions: { retry: 1 },
          sources,
          supportCodeLibrary,
          type: 'json',
        })

        // Assert
        const result = JSON.parse(output)
        expect(result).to.have.lengthOf(1)
        expect(result[0].elements).to.have.lengthOf(1)
        expect(result[0].elements[0].steps).to.have.lengthOf(1)
        expect(result[0].elements[0].steps[0].result).to.eql({
          duration: 0,
          status: 'passed',
        })
      })
    })

    describe('failed', () => {
      it('includes the error message', async () => {
        // Arrange
        const sources = [
          {
            data: [
              'Feature: my feature',
              '  Scenario: my scenario',
              '    Given a failing step',
            ].join('\n'),
            uri: 'a.feature',
          },
        ]

        const supportCodeLibrary = getJsonFormatterSupportCodeLibrary(clock)

        // Act
        const output = await testFormatter({
          sources,
          supportCodeLibrary,
          type: 'json',
        })

        // Assert
        const step = JSON.parse(output)[0].elements[0].steps[0]
        expect(step.result).to.eql({
          duration: 0,
          error_message: 'error',
          status: 'failed',
        })
      })
    })

    describe('without a step definition', () => {
      it('does not output a match attribute for the step', async () => {
        // Arrange
        const sources = [
          {
            data: [
              'Feature: my feature',
              '  Scenario: my scenario',
              '    Given a passing step',
            ].join('\n'),
            uri: 'a.feature',
          },
        ]

        // Act
        const output = await testFormatter({
          sources,
          type: 'json',
        })

        // Assert
        const step = JSON.parse(output)[0].elements[0].steps[0]
        expect(step).to.not.have.key('match')
      })
    })

    describe('with hooks', () => {
      it('outputs the hooks with special properties', async () => {
        // Arrange
        const sources = [
          {
            data: [
              'Feature: my feature',
              '  Scenario: my scenario',
              '    Given a passing step',
            ].join('\n'),
            uri: 'a.feature',
          },
        ]

        const supportCodeLibrary = getJsonFormatterSupportCodeLibraryWithHooks()

        // Act
        const output = await testFormatter({
          sources,
          supportCodeLibrary,
          type: 'json',
        })

        // Assert
        const steps = JSON.parse(output)[0].elements[0].steps
        const expectedBefore = {
          hidden: true,
          keyword: 'Before',
          result: {
            duration: 0,
            status: 'passed',
          },
        }
        const expectedAfter = {
          hidden: true,
          keyword: 'After',
          result: {
            duration: 0,
            status: 'passed',
          },
        }
        const expectedStep = {
          arguments: [] as any[],
          keyword: 'Given ',
          line: 3,
          match: {
            location: 'json_formatter_steps.ts:39',
          },
          name: 'a passing step',
          result: {
            duration: 0,
            status: 'passed',
          },
        }
        expect(steps).to.eql([expectedBefore, expectedStep, expectedAfter])
      })
    })

    describe('with attachments', () => {
      it('outputs the step with embeddings', async function () {
        // Arrange
        const sources = [
          {
            data: [
              'Feature: my feature',
              '  Scenario: my scenario',
              '    Given a step that attaches',
            ].join('\n'),
            uri: 'a.feature',
          },
        ]

        const supportCodeLibrary = getJsonFormatterSupportCodeLibrary(clock)

        // Act
        const output = await testFormatter({
          sources,
          supportCodeLibrary,
          type: 'json',
        })

        const steps = JSON.parse(output)[0].elements[0].steps
        expect(steps[0].embeddings).to.deep.eq([
          {
            data: 'iVBORw==',
            mime_type: 'image/png',
          },
        ])
      })
    })

    describe('with a doc string', () => {
      it('outputs the doc string as a step argument', async () => {
        // Arrange
        const sources = [
          {
            data: [
              'Feature: my feature',
              '  Scenario: my scenario',
              '    Given a step',
              '      """',
              '      This is a DocString',
              '      """',
            ].join('\n'),
            uri: 'a.feature',
          },
        ]

        const supportCodeLibrary = getJsonFormatterSupportCodeLibrary(clock)

        // Act
        const output = await testFormatter({
          sources,
          supportCodeLibrary,
          type: 'json',
        })

        // Assert
        const stepArguments = JSON.parse(output)[0].elements[0].steps[0]
          .arguments
        expect(stepArguments).to.eql([
          {
            content: 'This is a DocString',
            line: 4,
          },
        ])
      })
    })

    describe(' with a data table string', () => {
      it('outputs the data table as a step argument', async () => {
        // Arrange
        const sources = [
          {
            data: [
              'Feature: my feature',
              '  Scenario: my scenario',
              '    Given a step',
              '      |aaa|b|c|',
              '      |d|e|ff|',
              '      |gg|h|iii|',
            ].join('\n'),
            uri: 'a.feature',
          },
        ]

        const supportCodeLibrary = getJsonFormatterSupportCodeLibrary(clock)

        // Act
        const output = await testFormatter({
          sources,
          supportCodeLibrary,
          type: 'json',
        })

        // Assert
        const stepArguments = JSON.parse(output)[0].elements[0].steps[0]
          .arguments
        expect(stepArguments).to.eql([
          {
            rows: [
              { cells: ['aaa', 'b', 'c'] },
              { cells: ['d', 'e', 'ff'] },
              { cells: ['gg', 'h', 'iii'] },
            ],
          },
        ])
      })
    })

    describe(' with tagged examples', () => {
      it('outputs the examples', async () => {
        // Arrange
        const sources = [
          {
            data: [
              'Feature: my feature',
              '  Scenario: my scenario',
              '    Given a step <id>',
              '',
              '    @tag-1-2',
              '    Examples:',
              '      |id|',
              '      | 1|',
              '      | 2|',
              '',
              '    @tag @tag-3-4',
              '    Examples:',
              '      |id|',
              '      | 3|',
              '      | 4|',
            ].join('\n'),
            uri: 'a.feature',
          },
        ]

        const supportCodeLibrary = getJsonFormatterSupportCodeLibrary(clock)

        // Act
        const output = await testFormatter({
          sources,
          supportCodeLibrary,
          type: 'json',
        })

        // Assert
        const jsonFeature: IJsonFeature = JSON.parse(output)[0]
        const jsonScenarios = jsonFeature.elements
        const jsonScenarioTags = jsonScenarios.map((s: IJsonScenario) => s.tags)

        const expectedTags = [
          [{ line: 5, name: '@tag-1-2' }],
          [{ line: 5, name: '@tag-1-2' }],
          [
            { line: 11, name: '@tag' },
            { line: 11, name: '@tag-3-4' },
          ],
          [
            { line: 11, name: '@tag' },
            { line: 11, name: '@tag-3-4' },
          ],
        ]

        expect(jsonScenarioTags).to.eql(expectedTags)
      })
    })
  })

  describe('one rule with several examples (scenarios)', () => {
    describe('passed', () => {
      it('outputs the feature', async () => {
        // Arrange
        const sources = [
          {
            data: [
              '@tag1 @tag2',
              'Feature: my feature',
              '  my feature description',
              '',
              '  Rule: my rule',
              '    my rule description',
              '',
              '    Example: first example',
              '      first example description',
              '',
              '      Given a passing step',
              '',
              '    Example: second example',
              '      second example description',
              '',
              '      Given a passing step',
            ].join('\n'),
            uri: 'a.feature',
          },
        ]

        const supportCodeLibrary = getJsonFormatterSupportCodeLibrary(clock)

        // Act
        const output = await testFormatter({
          sources,
          supportCodeLibrary,
          type: 'json',
        })

        // Assert
        expect(JSON.parse(output)).to.eql([
          {
            description: '  my feature description',
            elements: [
              {
                description: '      first example description',
                id: 'my-feature;my-rule;first-example',
                keyword: 'Example',
                line: 8,
                name: 'first example',
                type: 'scenario',
                steps: [
                  {
                    arguments: [],
                    line: 11,
                    match: {
                      location: 'json_formatter_steps.ts:12',
                    },
                    keyword: 'Given ',
                    name: 'a passing step',
                    result: {
                      status: 'passed',
                      duration: 1000000,
                    },
                  },
                ],
                tags: [
                  { name: '@tag1', line: 1 },
                  { name: '@tag2', line: 1 },
                ],
              },
              {
                description: '      second example description',
                id: 'my-feature;my-rule;second-example',
                keyword: 'Example',
                line: 13,
                name: 'second example',
                type: 'scenario',
                steps: [
                  {
                    arguments: [],
                    line: 16,
                    match: {
                      location: 'json_formatter_steps.ts:12',
                    },
                    keyword: 'Given ',
                    name: 'a passing step',
                    result: {
                      status: 'passed',
                      duration: 1000000,
                    },
                  },
                ],
                tags: [
                  { name: '@tag1', line: 1 },
                  { name: '@tag2', line: 1 },
                ],
              },
            ],
            id: 'my-feature',
            keyword: 'Feature',
            line: 2,
            name: 'my feature',
            tags: [
              { name: '@tag1', line: 1 },
              { name: '@tag2', line: 1 },
            ],
            uri: 'a.feature',
          },
        ])
      })
    })
  })
})
