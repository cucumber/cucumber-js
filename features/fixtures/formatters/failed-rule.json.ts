module.exports = [
  {
    description: '',
    elements: [
      {
        description: '',
        id: 'a-feature;a-rule;an-example',
        keyword: 'Example',
        line: 3,
        name: 'an example',
        steps: [
          {
            arguments: [],
            keyword: 'Given ',
            line: 4,
            name: 'a step',
            match: {
              location: 'features/step_definitions/steps.js:3',
            },
            result: {
              status: 'failed',
              duration: 0,
              error_message:
                'Error: my error\n    at World.<anonymous> (features/step_definitions/steps.js:3:49)',
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
