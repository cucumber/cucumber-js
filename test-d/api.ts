import type { IRunEnvironment } from '../api'

// environment variables accepts an object literal
const _fromLiteral: IRunEnvironment = {
  env: {
    FOO: 'BAR',
  },
}

// environment variables accepts a NodeJS.ProcessEnv
const _fromProcessEnv: IRunEnvironment = {
  env: process.env,
}
