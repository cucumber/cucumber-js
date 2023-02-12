module.exports = [
  {
    source: {
      uri: 'features/a.feature',
      data: 'Feature: a feature\n  Scenario Outline: a scenario\n    Given a <thing>\n  Examples:\n    | thing |\n    | hop   |\n    | step  |\n    | jump  |',
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
              keyword: 'Scenario Outline',
              name: 'a scenario',
              description: '',
              steps: [
                {
                  location: {
                    line: 3,
                    column: 5,
                  },
                  keyword: 'Given ',
                  text: 'a <thing>',
                  id: '5d5fdf49-f895-4762-a573-25298f724ff1',
                  keywordType: 'Context',
                },
              ],
              examples: [
                {
                  location: {
                    line: 4,
                    column: 3,
                  },
                  tags: [],
                  keyword: 'Examples',
                  name: '',
                  description: '',
                  tableBody: [
                    {
                      location: {
                        line: 6,
                        column: 5,
                      },
                      cells: [
                        {
                          location: {
                            line: 6,
                            column: 7,
                          },
                          value: 'hop',
                        },
                      ],
                      id: '3c9ecdb7-88c3-498b-9c66-c2af131812e3',
                    },
                    {
                      location: {
                        line: 7,
                        column: 5,
                      },
                      cells: [
                        {
                          location: {
                            line: 7,
                            column: 7,
                          },
                          value: 'step',
                        },
                      ],
                      id: '31296968-d322-4b73-9321-ee3177a4cb42',
                    },
                    {
                      location: {
                        line: 8,
                        column: 5,
                      },
                      cells: [
                        {
                          location: {
                            line: 8,
                            column: 7,
                          },
                          value: 'jump',
                        },
                      ],
                      id: 'fcbafbc5-4084-4a43-ad3a-20ad8cd31671',
                    },
                  ],
                  id: 'c9b5f240-2d53-4b44-b5bb-80cd8013569b',
                  tableHeader: {
                    location: {
                      line: 5,
                      column: 5,
                    },
                    cells: [
                      {
                        location: {
                          line: 5,
                          column: 7,
                        },
                        value: 'thing',
                      },
                    ],
                    id: 'd06ed49c-91cb-41aa-a2b8-f974b4999d47',
                  },
                },
              ],
              id: 'c7298d57-92ec-4d2b-96aa-8083cddeac78',
            },
          },
        ],
      },
      uri: 'features/a.feature',
    },
  },
  {
    pickle: {
      id: '2fa3374f-76c1-4832-8504-71e3aa172ee4',
      uri: 'features/a.feature',
      name: 'a scenario',
      language: 'en',
      steps: [
        {
          astNodeIds: [
            '5d5fdf49-f895-4762-a573-25298f724ff1',
            '3c9ecdb7-88c3-498b-9c66-c2af131812e3',
          ],
          id: '54d67447-5004-498b-b3f7-78cbc3021688',
          text: 'a hop',
          type: 'Context',
        },
      ],
      tags: [],
      astNodeIds: [
        'c7298d57-92ec-4d2b-96aa-8083cddeac78',
        '3c9ecdb7-88c3-498b-9c66-c2af131812e3',
      ],
    },
  },
  {
    pickle: {
      id: '69085b29-2f23-4cae-b8a4-e7908ce8de3d',
      uri: 'features/a.feature',
      name: 'a scenario',
      language: 'en',
      steps: [
        {
          astNodeIds: [
            '5d5fdf49-f895-4762-a573-25298f724ff1',
            '31296968-d322-4b73-9321-ee3177a4cb42',
          ],
          id: '89ad04e8-8070-4788-83ce-337a8958a6b1',
          text: 'a step',
          type: 'Context',
        },
      ],
      tags: [],
      astNodeIds: [
        'c7298d57-92ec-4d2b-96aa-8083cddeac78',
        '31296968-d322-4b73-9321-ee3177a4cb42',
      ],
    },
  },
  {
    pickle: {
      id: '064a7d6f-1b7b-430d-93a7-736bb1ab5f77',
      uri: 'features/a.feature',
      name: 'a scenario',
      language: 'en',
      steps: [
        {
          astNodeIds: [
            '5d5fdf49-f895-4762-a573-25298f724ff1',
            'fcbafbc5-4084-4a43-ad3a-20ad8cd31671',
          ],
          id: '6d1c160b-fedf-4782-b723-d7aa3dc06de4',
          text: 'a jump',
          type: 'Context',
        },
      ],
      tags: [],
      astNodeIds: [
        'c7298d57-92ec-4d2b-96aa-8083cddeac78',
        'fcbafbc5-4084-4a43-ad3a-20ad8cd31671',
      ],
    },
  },
  {
    stepDefinition: {
      id: '326346f1-f45e-4f64-a77a-290e35e413bf',
      pattern: {
        source: 'a hop',
        type: 'CUCUMBER_EXPRESSION',
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
    stepDefinition: {
      id: '728ee53a-e868-439c-8912-9c8aa495afcb',
      pattern: {
        source: 'a step',
        type: 'CUCUMBER_EXPRESSION',
      },
      sourceReference: {
        uri: 'features/step_definitions/steps.js',
        location: {
          line: 4,
        },
      },
    },
  },
  {
    stepDefinition: {
      id: '02c48ae5-c554-4498-97bb-836ab32a3e89',
      pattern: {
        source: 'a jump',
        type: 'CUCUMBER_EXPRESSION',
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
        seconds: 1676103296,
        nanos: 783000000,
      },
    },
  },
  {
    testCase: {
      id: '837d2ca9-811e-41e1-a99e-0e53191d4f08',
      pickleId: '2fa3374f-76c1-4832-8504-71e3aa172ee4',
      testSteps: [
        {
          id: 'd409d983-ee52-420d-9d9f-e297115f7cd4',
          pickleStepId: '54d67447-5004-498b-b3f7-78cbc3021688',
          stepDefinitionIds: ['326346f1-f45e-4f64-a77a-290e35e413bf'],
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
    testCase: {
      id: '01b23513-26ef-4da3-b93b-42249186bdf1',
      pickleId: '69085b29-2f23-4cae-b8a4-e7908ce8de3d',
      testSteps: [
        {
          id: '6e4ac7a0-3bce-4092-995f-4a22f5031517',
          pickleStepId: '89ad04e8-8070-4788-83ce-337a8958a6b1',
          stepDefinitionIds: ['728ee53a-e868-439c-8912-9c8aa495afcb'],
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
    testCase: {
      id: 'c945cc17-6926-4458-8600-9453a3f7e14d',
      pickleId: '064a7d6f-1b7b-430d-93a7-736bb1ab5f77',
      testSteps: [
        {
          id: '6f4669ab-0363-483a-9de8-ab7d18424fde',
          pickleStepId: '6d1c160b-fedf-4782-b723-d7aa3dc06de4',
          stepDefinitionIds: ['02c48ae5-c554-4498-97bb-836ab32a3e89'],
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
      id: '7815d328-9d6f-41b8-ba8d-13af0337a62e',
      testCaseId: '837d2ca9-811e-41e1-a99e-0e53191d4f08',
      timestamp: {
        seconds: 1676103296,
        nanos: 787000000,
      },
    },
  },
  {
    testStepStarted: {
      testCaseStartedId: '7815d328-9d6f-41b8-ba8d-13af0337a62e',
      testStepId: 'd409d983-ee52-420d-9d9f-e297115f7cd4',
      timestamp: {
        seconds: 1676103296,
        nanos: 787000000,
      },
    },
  },
  {
    testStepFinished: {
      testCaseStartedId: '7815d328-9d6f-41b8-ba8d-13af0337a62e',
      testStepId: 'd409d983-ee52-420d-9d9f-e297115f7cd4',
      testStepResult: {
        duration: {
          seconds: 0,
          nanos: 0,
        },
        status: 'PASSED',
      },
      timestamp: {
        seconds: 1676103296,
        nanos: 787000000,
      },
    },
  },
  {
    testCaseFinished: {
      testCaseStartedId: '7815d328-9d6f-41b8-ba8d-13af0337a62e',
      timestamp: {
        seconds: 1676103296,
        nanos: 788000000,
      },
      willBeRetried: false,
    },
  },
  {
    testCaseStarted: {
      attempt: 0,
      id: '1364cc60-09dd-4dba-a69f-0c1d916911d5',
      testCaseId: '01b23513-26ef-4da3-b93b-42249186bdf1',
      timestamp: {
        seconds: 1676103296,
        nanos: 788000000,
      },
    },
  },
  {
    testStepStarted: {
      testCaseStartedId: '1364cc60-09dd-4dba-a69f-0c1d916911d5',
      testStepId: '6e4ac7a0-3bce-4092-995f-4a22f5031517',
      timestamp: {
        seconds: 1676103296,
        nanos: 788000000,
      },
    },
  },
  {
    testStepFinished: {
      testCaseStartedId: '1364cc60-09dd-4dba-a69f-0c1d916911d5',
      testStepId: '6e4ac7a0-3bce-4092-995f-4a22f5031517',
      testStepResult: {
        duration: {
          seconds: 0,
          nanos: 0,
        },
        status: 'PASSED',
      },
      timestamp: {
        seconds: 1676103296,
        nanos: 788000000,
      },
    },
  },
  {
    testCaseFinished: {
      testCaseStartedId: '1364cc60-09dd-4dba-a69f-0c1d916911d5',
      timestamp: {
        seconds: 1676103296,
        nanos: 788000000,
      },
      willBeRetried: false,
    },
  },
  {
    testCaseStarted: {
      attempt: 0,
      id: '90918ddf-ad2d-4073-9012-5432922b3dd3',
      testCaseId: 'c945cc17-6926-4458-8600-9453a3f7e14d',
      timestamp: {
        seconds: 1676103296,
        nanos: 788000000,
      },
    },
  },
  {
    testStepStarted: {
      testCaseStartedId: '90918ddf-ad2d-4073-9012-5432922b3dd3',
      testStepId: '6f4669ab-0363-483a-9de8-ab7d18424fde',
      timestamp: {
        seconds: 1676103296,
        nanos: 788000000,
      },
    },
  },
  {
    testStepFinished: {
      testCaseStartedId: '90918ddf-ad2d-4073-9012-5432922b3dd3',
      testStepId: '6f4669ab-0363-483a-9de8-ab7d18424fde',
      testStepResult: {
        duration: {
          seconds: 0,
          nanos: 0,
        },
        status: 'PASSED',
      },
      timestamp: {
        seconds: 1676103296,
        nanos: 788000000,
      },
    },
  },
  {
    testCaseFinished: {
      testCaseStartedId: '90918ddf-ad2d-4073-9012-5432922b3dd3',
      timestamp: {
        seconds: 1676103296,
        nanos: 788000000,
      },
      willBeRetried: false,
    },
  },
  {
    testRunFinished: {
      success: true,
      timestamp: {
        seconds: 1676103296,
        nanos: 788000000,
      },
    },
  },
]
