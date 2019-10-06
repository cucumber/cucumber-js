module.exports = {
  gherkinDocuments: [
    {
      type: 'GherkinDocument',
      feature: {
        type: 'Feature',
        tags: [],
        location: { line: 1, column: 1 },
        language: 'en',
        keyword: 'Feature',
        name: 'a feature',
        children: [
          {
            type: 'Scenario',
            tags: [],
            location: { line: 2, column: 3 },
            keyword: 'Scenario',
            name: 'a scenario',
            steps: [
              {
                type: 'Step',
                location: { line: 3, column: 5 },
                keyword: 'Given ',
                text: 'a step',
              },
            ],
          },
        ],
      },
      comments: [],
      uri: 'features/a.feature',
    },
  ],
  pickles: [
    {
      tags: [],
      name: 'a scenario',
      language: 'en',
      locations: [{ line: 2, column: 3 }],
      steps: [
        { text: 'a step', arguments: [], locations: [{ line: 3, column: 11 }] },
      ],
      uri: 'features/a.feature',
    },
  ],
  testCaseAttempts: [
    {
      testCase: {
        attemptNumber: 1,
        name: 'a scenario',
        result: {
          duration: 0,
          status: 'passed',
        },
        sourceLocation: {
          uri: 'features/a.feature',
          line: 2,
        },
      },
      testSteps: [
        {
          actionLocation: {
            uri: 'features/step_definitions/steps.js',
            line: 3,
          },
          arguments: [],
          attachments: [],
          keyword: 'Given ',
          result: {
            duration: 0,
            status: 'passed',
          },
          sourceLocation: {
            uri: 'features/a.feature',
            line: 3,
          },
          text: 'a step',
        },
      ],
    },
  ],
}
