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
            rule: {
              location: {
                line: 2,
                column: 3,
              },
              tags: [],
              keyword: 'Rule',
              name: 'a rule',
              description: '',
              children: [
                {
                  scenario: {
                    location: {
                      line: 3,
                      column: 5,
                    },
                    tags: [],
                    keyword: 'Example',
                    name: 'an example',
                    description: '',
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
                    examples: [],
                    id: '2',
                  },
                },
              ],
              id: '3',
            },
          },
        ],
      },
      uri: 'features/a.feature',
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
          astNodeIds: ['1'],
          id: '4',
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
          line: 3,
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
      id: '6',
      pickleId: '5',
      testSteps: [
        {
          id: '7',
          pickleStepId: '4',
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
      id: '8',
      testCaseId: '6',
      timestamp: {
        seconds: 0,
        nanos: 1000000,
      },
    },
  },
  {
    testStepStarted: {
      testCaseStartedId: '8',
      testStepId: '7',
      timestamp: {
        seconds: 0,
        nanos: 2000000,
      },
    },
  },
  {
    testStepFinished: {
      testCaseStartedId: '8',
      testStepId: '7',
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
        nanos: 3000000,
      },
    },
  },
  {
    testCaseFinished: {
      testCaseStartedId: '8',
      timestamp: {
        seconds: 0,
        nanos: 4000000,
      },
    },
  },
  {
    testRunFinished: {
      success: true,
      timestamp: {
        seconds: 0,
        nanos: 5000000,
      },
    },
  },
]
