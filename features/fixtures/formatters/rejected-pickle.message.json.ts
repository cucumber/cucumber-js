module.exports = [
  {
    source: {
      uri: 'features/a.feature',
      data: 'Feature: a feature\n  Scenario: a scenario\n    Given a step',
      mediaType: 'text/x.cucumber.gherkin+plain',
    },
  },
  {
    gherkinDocument: {
      comments: [],
      feature: {
        location: {
          line: 1,
          column: 1,
        },
        tags: [],
        language: 'en',
        keyword: 'Feature',
        name: 'a feature',
        description: '',
        children: [
          {
            scenario: {
              location: {
                line: 2,
                column: 3,
              },
              tags: [],
              keyword: 'Scenario',
              name: 'a scenario',
              description: '',
              steps: [
                {
                  location: {
                    line: 3,
                    column: 5,
                  },
                  keyword: 'Given ',
                  text: 'a step',
                  id: '0',
                },
              ],
              examples: [],
              id: '1',
            },
          },
        ],
      },
      uri: 'features/a.feature',
    },
  },
  {
    pickle: {
      id: '3',
      uri: 'features/a.feature',
      name: 'a scenario',
      language: 'en',
      steps: [
        {
          astNodeIds: ['0'],
          id: '2',
          text: 'a step',
        },
      ],
      tags: [],
      astNodeIds: ['1'],
    },
  },
  {
    testRunStarted: {
      timestamp: {
        seconds: 0,
        nanos: 0,
      },
    },
  },
  {
    testRunFinished: {
      success: true,
      timestamp: {
        seconds: 0,
        nanos: 1000000,
      },
    },
  },
]
