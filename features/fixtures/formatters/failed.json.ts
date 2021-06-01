module.exports = [
  {
    description: '',
    elements: [
      {
        description: '',
        id: 'a-feature;a-scenario',
        keyword: 'Scenario',
        line: 2,
        name: 'a scenario',
        steps: [
          {
            arguments: [],
            keyword: 'Given ',
            line: 3,
            name: 'a step',
            match: {
              location: 'features/step_definitions/steps.js:3',
            },
            result: {
              status: 'failed',
              duration: 0,
              error_message: 'Error: my error',
            },
          },
        ],
        tags: [],
        type: 'scenario',
      },
    ],
    id: 'a-feature',
    line: 1,
    keyword: 'Feature',
    name: 'a feature',
    tags: [],
    uri: 'features/a.feature',
  },
]
