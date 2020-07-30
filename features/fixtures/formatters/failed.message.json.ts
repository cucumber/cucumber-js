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
                  id: '1',
                },
              ],
              id: '2',
            },
          },
        ],
      },
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
          text: 'a step',
          id: '3',
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
      id: '5',
      pickleId: '4',
      testSteps: [
        {
          id: '6',
          pickleStepId: '3',
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
      testCaseId: '5',
      id: '7',
    },
  },
  {
    testStepStarted: {
      timestamp: {
        seconds: '0',
        nanos: 2000000,
      },
      testStepId: '6',
      testCaseStartedId: '7',
    },
  },
  {
    testStepFinished: {
      testStepResult: {
        status: 'FAILED',
        message:
          'Error: my error\n    at World.<anonymous> (features/step_definitions/steps.js:3:49)',
        duration: {
          seconds: '0',
          nanos: 1000000,
        },
      },
      timestamp: {
        seconds: '0',
        nanos: 3000000,
      },
      testStepId: '6',
      testCaseStartedId: '7',
    },
  },
  {
    testCaseFinished: {
      timestamp: {
        seconds: '0',
        nanos: 4000000,
      },
      testCaseStartedId: '7',
    },
  },
  {
    testRunFinished: {
      success: false,
      timestamp: {
        seconds: '0',
        nanos: 5000000,
      },
    },
  },
]
