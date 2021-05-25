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
                  id: '1',
                },
              ],
              examples: [],
              id: '2',
            },
          },
        ],
      },
      uri: 'features/a.feature',
    },
  },
  {
    pickle: {
      id: '4',
      uri: 'features/a.feature',
      name: 'a scenario',
      language: 'en',
      steps: [
        {
          astNodeIds: ['1'],
          id: '3',
          text: 'a step',
        },
      ],
      tags: [],
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
          line: 5,
        },
      },
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
    testCase: {
      id: '5',
      pickleId: '4',
      testSteps: [
        {
          id: '6',
          pickleStepId: '3',
          stepDefinitionIds: ['0'],
          stepMatchArgumentsLists: [
            {
              stepMatchArguments: [],
            },
          ],
        },
      ],
    },
  },
  {
    testCaseStarted: {
      attempt: 0,
      id: '7',
      testCaseId: '5',
      timestamp: {
        seconds: 0,
        nanos: 1000000,
      },
    },
  },
  {
    testStepStarted: {
      testCaseStartedId: '7',
      testStepId: '6',
      timestamp: {
        seconds: 0,
        nanos: 2000000,
      },
    },
  },
  {
    testStepFinished: {
      testCaseStartedId: '7',
      testStepId: '6',
      testStepResult: {
        duration: {
          seconds: 0,
          nanos: 0,
        },
        status: 'FAILED',
        willBeRetried: true,
        message:
          'Error: my error\n    at World.<anonymous> (features/step_definitions/steps.js:11:12)',
      },
      timestamp: {
        seconds: 0,
        nanos: 3000000,
      },
    },
  },
  {
    testCaseFinished: {
      testCaseStartedId: '7',
      timestamp: {
        seconds: 0,
        nanos: 4000000,
      },
    },
  },
  {
    testCaseStarted: {
      attempt: 1,
      id: '8',
      testCaseId: '5',
      timestamp: {
        seconds: 0,
        nanos: 5000000,
      },
    },
  },
  {
    testStepStarted: {
      testCaseStartedId: '8',
      testStepId: '6',
      timestamp: {
        seconds: 0,
        nanos: 6000000,
      },
    },
  },
  {
    testStepFinished: {
      testCaseStartedId: '8',
      testStepId: '6',
      testStepResult: {
        duration: {
          seconds: 0,
          nanos: 0,
        },
        status: 'PASSED',
        willBeRetried: false,
      },
      timestamp: {
        seconds: 0,
        nanos: 7000000,
      },
    },
  },
  {
    testCaseFinished: {
      testCaseStartedId: '8',
      timestamp: {
        seconds: 0,
        nanos: 8000000,
      },
    },
  },
  {
    testRunFinished: {
      success: true,
      timestamp: {
        seconds: 0,
        nanos: 9000000,
      },
    },
  },
]
