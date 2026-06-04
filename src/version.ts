import { createRequire } from 'node:module'

export const version: string = createRequire(__filename)('../package.json').version
