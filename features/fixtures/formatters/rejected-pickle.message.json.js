module.exports = [
  {
    source: {
      uri: 'features/a.feature',
      data: 'Feature: a feature\n  Scenario: a scenario\n    Given a step',
      media: {
        encoding: 'UTF8',
        contentType: 'text/x.cucumber.gherkin+plain',
      },
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
    pickleRejected: {
      pickleId: '3',
    },
  },
  {
    testRunStarted: {},
  },
  {
    testRunFinished: {
      success: true,
    },
  },
]
