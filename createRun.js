const axios = require('axios')
const TOKEN = '5f1bc205aca61dd3bfce7fba2d4f3f05'
const createRun = async () => {
  const run = await axios.post(
    'https://dev.api.blinq.io/api/runs/cucumber-runs/create',
    {
      name: 'abcjflsdafj',
    },
    {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'x-source': 'cucumber_js',
      },
    }
  )
  console.log(`RUN_ID: ${run.data.run._id}`)
  console.log(`PROJECT_ID: ${run.data.run.project_id}`)
}

createRun()
