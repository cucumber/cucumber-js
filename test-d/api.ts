import { IRunEnvironment } from '../api'

// environment variables accepts an object literal
const fromLiteral: IRunEnvironment = {
  env: {
    FOO: 'BAR',
  },
}

// environment variables accepts a NodeJS.ProcessEnv
const fromProcessEnv: IRunEnvironment = {
  env: process.env,
}
