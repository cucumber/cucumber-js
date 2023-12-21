import path from 'node:path'
import { PassThrough } from 'node:stream'
import fs from 'mz/fs'
import { reindent } from 'reindent-template-literals'
import { IdGenerator } from '@cucumber/messages'
import { IRunEnvironment } from './types'

const newId = IdGenerator.uuid()

export async function setupEnvironment(): Promise<Partial<IRunEnvironment>> {
  const cwd = path.join(__dirname, '..', '..', 'tmp', `api_${newId()}`)
  await fs.mkdir(path.join(cwd, 'features'), { recursive: true })
  await fs.writeFile(
    path.join(cwd, 'features', 'test.feature'),
    reindent(`Feature: test fixture
      Scenario: one
        Given a step
        Then another step`)
  )
  await fs.writeFile(
    path.join(cwd, 'features', 'steps.ts'),
    reindent(`import { Given, Then } from '../../../src'
    Given('a step', function () {})
    Then('another step', function () {})`)
  )
  await fs.writeFile(
    path.join(cwd, 'cucumber.mjs'),
    `export default {paths: ['features/test.feature'], requireModule: ['ts-node/register'], require: ['features/steps.ts']}`
  )
  const stdout = new PassThrough()
  return { cwd, stdout }
}

export async function teardownEnvironment(environment: IRunEnvironment) {
  return new Promise((resolve) => {
    fs.rm(environment.cwd, { recursive: true }, resolve)
  }).then(() => {
    environment.stdout.end()
  })
}
