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
      uri: 'features/a.feature',
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
            scenario: {
              location: {
                line: 2,
                column: 3,
              },
              keyword: 'Scenario',
              name: 'a scenario',
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
              id: '1',
            },
          },
        ],
      },
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
          text: 'a step',
          id: '2',
          astNodeIds: ['0'],
        },
      ],
      astNodeIds: ['1'],
    },
  },
  {
    testRunStarted: {
      timestamp: {
        seconds: '0',
        nanos: 0,
      },
    },
  },
  {
    testRunFinished: {
      success: true,
      timestamp: {
        seconds: '0',
        nanos: 1000000,
      },
    },
  },
]
