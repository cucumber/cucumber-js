module.exports = [
  {
    elements: [
      {
        id: 'a-feature;a-scenario',
        keyword: 'Scenario',
        line: 2,
        name: 'a scenario',
        steps: [
          {
            arguments: [],
            keyword: 'Given ',
            line: 3,
            match: {
              location: 'features/step_definitions/steps.js:3',
            },
            name: 'a step',
            result: {
              duration: 0,
              error_message:
                'Error: my error\n    at World.<anonymous> (features/step_definitions/steps.js:3:49)',
              status: 'failed',
            },
          },
        ],
        tags: [],
        type: 'scenario',
      },
    ],
    id: 'a-feature',
    keyword: 'Feature',
    line: 1,
    name: 'a feature',
    tags: [],
    uri: 'features/a.feature',
  },
]
