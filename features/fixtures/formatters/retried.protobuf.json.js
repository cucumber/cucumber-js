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
          sourceIds: ['1'],
        },
      ],
      sourceIds: ['2'],
    },
  },
  {
    pickleAccepted: {
      pickleId: '4',
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
          stepDefinitionId: ['0'],
        },
      ],
    },
  },
  {
    testCaseStarted: {
      attempt: 0,
      testCaseId: '5',
      id: '7',
    },
  },
  {
    testStepStarted: {
      testStepId: '6',
      testCaseStartedId: '7',
    },
  },
  {
    testStepFinished: {
      testResult: {
        status: 'FAILED',
        message:
          'Error: my error\n    at World.<anonymous> (features/step_definitions/steps.js:11:12)',
        duration: {
          seconds: '0',
          nanos: 0,
        },
      },
      testStepId: '6',
      testCaseStartedId: '7',
    },
  },
  {
    testCaseFinished: {
      testResult: {
        status: 'FAILED',
        message:
          'Error: my error\n    at World.<anonymous> (features/step_definitions/steps.js:11:12)',
        duration: {
          seconds: '0',
          nanos: 0,
        },
        willBeRetried: true,
      },
      testCaseStartedId: '7',
    },
  },
  {
    testCaseStarted: {
      attempt: 1,
      testCaseId: '5',
      id: '8',
    },
  },
  {
    testStepStarted: {
      testStepId: '6',
      testCaseStartedId: '8',
    },
  },
  {
    testStepFinished: {
      testResult: {
        status: 'PASSED',
        duration: {
          seconds: '0',
          nanos: 0,
        },
      },
      testStepId: '6',
      testCaseStartedId: '8',
    },
  },
  {
    testCaseFinished: {
      testResult: {
        status: 'PASSED',
        duration: {
          seconds: '0',
          nanos: 0,
        },
      },
      testCaseStartedId: '8',
    },
  },
  {
    testRunFinished: {
      success: true,
    },
  },
]
