module.exports = [
  {
    source: {
      uri: 'features/a.feature',
      data:
        'Feature: a feature\n  Rule: a rule\n    Example: an example\n      Given a step',
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
      name: 'an example',
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
    pickleAccepted: {
      pickleId: '4',
    },
  },
  {
    testRunStarted: {},
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
        status: 'PASSED',
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
        status: 'PASSED',
        duration: {
          seconds: '0',
          nanos: 0,
        },
      },
      testCaseStartedId: '7',
    },
  },
  {
    testRunFinished: {
      success: true,
    },
  },
]
