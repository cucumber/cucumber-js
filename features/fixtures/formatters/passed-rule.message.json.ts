module.exports = [
  {
    source: {
      uri: 'features/a.feature',
      data:
        'Feature: a feature\n  Rule: a rule\n    Example: an example\n      Given a step',
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
            rule: {
              location: {
                line: 2,
                column: 3,
              },
              keyword: 'Rule',
              name: 'a rule',
              children: [
                {
                  scenario: {
                    location: {
                      line: 3,
                      column: 5,
                    },
                    keyword: 'Example',
                    name: 'an example',
                    steps: [
                      {
                        location: {
                          line: 4,
                          column: 7,
                        },
                        keyword: 'Given ',
                        text: 'a step',
                        id: '1',
                      },
                    ],
                    id: '2',
                  },
                },
              ],
              id: '3',
            },
          },
        ],
      },
    },
  },
  {
    pickle: {
      id: '5',
      uri: 'features/a.feature',
      name: 'an example',
      language: 'en',
      steps: [
        {
          text: 'a step',
          id: '4',
          astNodeIds: ['1'],
        },
      ],
      astNodeIds: ['2'],
    },
  },
  {
    stepDefinition: {
      id: '0',
      pattern: {
        source: '/^a step$/',
        type: 'REGULAR_EXPRESSION',
      },
      sourceReference: {
        uri: 'features/step_definitions/steps.js',
        location: {
          line: 3,
        },
      },
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
    testCase: {
      id: '6',
      pickleId: '5',
      testSteps: [
        {
          id: '7',
          pickleStepId: '4',
          stepDefinitionIds: ['0'],
        },
      ],
    },
  },
  {
    testCaseStarted: {
      timestamp: {
        seconds: '0',
        nanos: 1000000,
      },
      attempt: 0,
      testCaseId: '6',
      id: '8',
    },
  },
  {
    testStepStarted: {
      timestamp: {
        seconds: '0',
        nanos: 2000000,
      },
      testStepId: '7',
      testCaseStartedId: '8',
    },
  },
  {
    testStepFinished: {
      testStepResult: {
        status: 'PASSED',
        duration: {
          seconds: '0',
          nanos: 1000000,
        },
      },
      timestamp: {
        seconds: '0',
        nanos: 3000000,
      },
      testStepId: '7',
      testCaseStartedId: '8',
    },
  },
  {
    testCaseFinished: {
      timestamp: {
        seconds: '0',
        nanos: 4000000,
      },
      testCaseStartedId: '8',
    },
  },
  {
    testRunFinished: {
      success: true,
      timestamp: {
        seconds: '0',
        nanos: 5000000,
      },
    },
  },
]
