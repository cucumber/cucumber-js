import { describe, it, beforeEach } from 'mocha'
import { expect } from 'chai'
import {
  getGherkinScenarioLocationMap,
  getGherkinScenarioMap,
  getGherkinStepMap,
} from './gherkin_document_parser'

describe('GherkinDocumentParser', () => {
  describe('with a Background and Scenario', () => {
    let sourceData
    beforeEach(() => {
      // Arrange
      sourceData = {
        comments: [],
        feature: {
          location: {
            line: 1,
            column: 1,
          },
          language: 'en',
          keyword: 'Feature',
          name: 'a feature',
          children: [
            {
              background: {
                location: {
                  line: 2,
                  column: 3,
                },
                keyword: 'Background',
                name: '',
                steps: [
                  {
                    location: {
                      line: 3,
                      column: 5,
                    },
                    keyword: 'Given ',
                    text: 'a setup step',
                    id: '1',
                  },
                ],
              },
            },
            {
              scenario: {
                location: {
                  line: 5,
                  column: 3,
                },
                keyword: 'Scenario',
                name: '',
                steps: [
                  {
                    location: {
                      line: 6,
                      column: 5,
                    },
                    keyword: 'When ',
                    text: 'a regular step',
                    id: '2',
                  },
                ],
                id: '3',
              },
            },
          ],
        },
        uri: 'features/a.feature',
      }
    })
    it('creates a map of step id to step', async () => {
      // Act
      const output = await getGherkinStepMap(sourceData)

      // Assert
      expect(output).to.eql({
        '1': {
          location: {
            line: 3,
            column: 5,
          },
          keyword: 'Given ',
          text: 'a setup step',
          id: '1',
        },
        '2': {
          location: {
            line: 6,
            column: 5,
          },
          keyword: 'When ',
          text: 'a regular step',
          id: '2',
        },
      })
    })
    it('creates a map of scenario id to scenario', async () => {
      // Act
      const output = await getGherkinScenarioMap(sourceData)

      // Assert
      expect(output).to.eql({
        '3': {
          id: '3',
          keyword: 'Scenario',
          location: {
            column: 3,
            line: 5,
          },
          name: '',
          steps: [
            {
              id: '2',
              keyword: 'When ',
              location: {
                column: 5,
                line: 6,
              },
              text: 'a regular step',
            },
          ],
        },
      })
    })
    it('creates a map of scenario/row id to location', async () => {
      // Act
      const output = await getGherkinScenarioLocationMap(sourceData)

      // Assert
      expect(output).to.eql({
        '3': {
          column: 3,
          line: 5,
        },
      })
    })
  })

  describe('with a Background and Scenario Outline', () => {
    let sourceData
    beforeEach(() => {
      // Arrange
      sourceData = {
        comments: [],
        feature: {
          location: {
            line: 1,
            column: 1,
          },
          language: 'en',
          keyword: 'Feature',
          name: 'a feature',
          children: [
            {
              background: {
                location: {
                  line: 2,
                  column: 3,
                },
                keyword: 'Background',
                name: '',
                steps: [
                  {
                    location: {
                      line: 3,
                      column: 5,
                    },
                    keyword: 'Given ',
                    text: 'a setup step',
                    id: '1',
                  },
                ],
              },
            },
            {
              scenario: {
                location: {
                  line: 5,
                  column: 3,
                },
                keyword: 'Scenario Outline',
                name: '',
                steps: [
                  {
                    location: {
                      line: 6,
                      column: 5,
                    },
                    keyword: 'When ',
                    text: 'a templated step with <word>',
                    id: '2',
                  },
                ],
                examples: [
                  {
                    location: {
                      line: 7,
                      column: 3,
                    },
                    keyword: 'Examples',
                    name: '',
                    tableHeader: {
                      location: {
                        line: 8,
                        column: 4,
                      },
                      cells: [
                        {
                          location: {
                            line: 8,
                            column: 6,
                          },
                          value: 'word',
                        },
                      ],
                      id: '3',
                    },
                    tableBody: [
                      {
                        location: {
                          line: 9,
                          column: 4,
                        },
                        cells: [
                          {
                            location: {
                              line: 9,
                              column: 6,
                            },
                            value: 'foo',
                          },
                        ],
                        id: '4',
                      },
                      {
                        location: {
                          line: 10,
                          column: 4,
                        },
                        cells: [
                          {
                            location: {
                              line: 10,
                              column: 6,
                            },
                            value: 'bar',
                          },
                        ],
                        id: '5',
                      },
                    ],
                  },
                ],
                id: '6',
              },
            },
          ],
        },
        uri: 'features/a.feature',
      }
    })
    it('creates a map of step id to step', async () => {
      // Act
      const output = await getGherkinStepMap(sourceData)

      // Assert
      expect(output).to.eql({
        '1': {
          location: {
            line: 3,
            column: 5,
          },
          keyword: 'Given ',
          text: 'a setup step',
          id: '1',
        },
        '2': {
          location: {
            line: 6,
            column: 5,
          },
          keyword: 'When ',
          text: 'a templated step with <word>',
          id: '2',
        },
      })
    })
    it('creates a map of scenario id to scenario', async () => {
      // Act
      const output = await getGherkinScenarioMap(sourceData)

      // Assert
      expect(output).to.eql({
        '6': {
          id: '6',
          keyword: 'Scenario Outline',
          location: {
            column: 3,
            line: 5,
          },
          name: '',
          steps: [
            {
              id: '2',
              keyword: 'When ',
              location: {
                column: 5,
                line: 6,
              },
              text: 'a templated step with <word>',
            },
          ],
          examples: [
            {
              keyword: 'Examples',
              location: {
                column: 3,
                line: 7,
              },
              name: '',
              tableBody: [
                {
                  cells: [
                    {
                      location: {
                        column: 6,
                        line: 9,
                      },
                      value: 'foo',
                    },
                  ],
                  id: '4',
                  location: {
                    column: 4,
                    line: 9,
                  },
                },
                {
                  cells: [
                    {
                      location: {
                        column: 6,
                        line: 10,
                      },
                      value: 'bar',
                    },
                  ],
                  id: '5',
                  location: {
                    column: 4,
                    line: 10,
                  },
                },
              ],
              tableHeader: {
                cells: [
                  {
                    location: {
                      column: 6,
                      line: 8,
                    },
                    value: 'word',
                  },
                ],
                id: '3',
                location: {
                  column: 4,
                  line: 8,
                },
              },
            },
          ],
        },
      })
    })
    it('creates a map of scenario/row id to location', async () => {
      // Act
      const output = await getGherkinScenarioLocationMap(sourceData)

      // Assert
      expect(output).to.eql({
        '6': {
          column: 3,
          line: 5,
        },
        '4': {
          column: 4,
          line: 9,
        },
        '5': {
          column: 4,
          line: 10,
        },
      })
    })
  })

  describe('with a Background and Rule with Examples', () => {
    let sourceData
    beforeEach(() => {
      // Arrange
      sourceData = {
        comments: [],
        feature: {
          location: {
            line: 1,
            column: 1,
          },
          language: 'en',
          keyword: 'Feature',
          name: 'a feature',
          children: [
            {
              background: {
                location: {
                  line: 2,
                  column: 3,
                },
                keyword: 'Background',
                name: '',
                steps: [
                  {
                    location: {
                      line: 3,
                      column: 5,
                    },
                    keyword: 'Given ',
                    text: 'a setup step',
                    id: '1',
                  },
                ],
              },
            },
            {
              rule: {
                location: {
                  line: 5,
                  column: 3,
                },
                keyword: 'Rule',
                name: 'a rule',
                children: [
                  {
                    scenario: {
                      location: {
                        line: 6,
                        column: 5,
                      },
                      keyword: 'Example',
                      name: 'an example',
                      steps: [
                        {
                          location: {
                            line: 7,
                            column: 7,
                          },
                          keyword: 'When ',
                          text: 'a regular step',
                          id: '2',
                        },
                        {
                          location: {
                            line: 8,
                            column: 7,
                          },
                          keyword: 'Then ',
                          text: 'an assertion',
                          id: '3',
                        },
                      ],
                      id: '4',
                    },
                  },
                  {
                    scenario: {
                      location: {
                        line: 10,
                        column: 5,
                      },
                      keyword: 'Example',
                      name: 'another example',
                      steps: [
                        {
                          location: {
                            line: 11,
                            column: 7,
                          },
                          keyword: 'When ',
                          text: 'another step',
                          id: '5',
                        },
                        {
                          location: {
                            line: 12,
                            column: 7,
                          },
                          keyword: 'Then ',
                          text: 'an assertion',
                          id: '6',
                        },
                      ],
                      id: '7',
                    },
                  },
                ],
              },
            },
          ],
        },
        uri: 'features/a.feature',
      }
    })
    it('creates a map of step id to step', async () => {
      // Act
      const output = await getGherkinStepMap(sourceData)

      // Assert
      expect(output).to.eql({
        '1': {
          location: {
            line: 3,
            column: 5,
          },
          keyword: 'Given ',
          text: 'a setup step',
          id: '1',
        },
        '2': {
          location: {
            line: 7,
            column: 7,
          },
          keyword: 'When ',
          text: 'a regular step',
          id: '2',
        },
        '3': {
          location: {
            line: 8,
            column: 7,
          },
          keyword: 'Then ',
          text: 'an assertion',
          id: '3',
        },
        '5': {
          location: {
            line: 11,
            column: 7,
          },
          keyword: 'When ',
          text: 'another step',
          id: '5',
        },
        '6': {
          location: {
            line: 12,
            column: 7,
          },
          keyword: 'Then ',
          text: 'an assertion',
          id: '6',
        },
      })
    })
    it('creates a map of scenario id to scenario', async () => {
      // Act
      const output = await getGherkinScenarioMap(sourceData)

      // Assert
      expect(output).to.eql({
        '4': {
          location: {
            line: 6,
            column: 5,
          },
          keyword: 'Example',
          name: 'an example',
          steps: [
            {
              location: {
                line: 7,
                column: 7,
              },
              keyword: 'When ',
              text: 'a regular step',
              id: '2',
            },
            {
              location: {
                line: 8,
                column: 7,
              },
              keyword: 'Then ',
              text: 'an assertion',
              id: '3',
            },
          ],
          id: '4',
        },
        '7': {
          location: {
            line: 10,
            column: 5,
          },
          keyword: 'Example',
          name: 'another example',
          steps: [
            {
              location: {
                line: 11,
                column: 7,
              },
              keyword: 'When ',
              text: 'another step',
              id: '5',
            },
            {
              location: {
                line: 12,
                column: 7,
              },
              keyword: 'Then ',
              text: 'an assertion',
              id: '6',
            },
          ],
          id: '7',
        },
      })
    })
    it('creates a map of scenario/row id to location', async () => {
      // Act
      const output = await getGherkinScenarioLocationMap(sourceData)

      // Assert
      expect(output).to.eql({
        '4': {
          line: 6,
          column: 5,
        },
        '7': {
          line: 10,
          column: 5,
        },
      })
    })
  })
})
