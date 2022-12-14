import { IdGenerator } from "@cucumber/messages";
import { IRunEnvironment  } from "./types";
import path from "path";
import fs from "mz/fs";
import { reindent } from "reindent-template-literals";
import { PassThrough } from "stream";
import { loadSupport } from "./load_support";
import { loadConfiguration } from "./load_configuration";
import { expect } from "chai";

const newId = IdGenerator.uuid()

async function setupEnvironment(): Promise<Partial<IRunEnvironment>> {
  const cwd = path.join(__dirname, '..', '..', 'tmp', `loadSupport_${newId()}`)
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

async function teardownEnvironment(environment: IRunEnvironment) {
  await fs.rmdir(environment.cwd, { recursive: true })
  environment.stdout.end()
}

describe('loadSupport', () => {
  let environment: IRunEnvironment
  beforeEach(async () => {
    environment = await setupEnvironment()
  })
  afterEach(async () => teardownEnvironment(environment))

  it("should include original paths in the returned support code library", async () => {
    const { runConfiguration } = await loadConfiguration({}, environment)
    const support = await loadSupport(runConfiguration, environment)

    expect(support.originalCoordinates).to.deep.eq({
      requireModules: [
        "ts-node/register"
      ],
      requirePaths: [
        `${environment.cwd}/features/steps.ts`
      ],
      importPaths: []
    })
  });
})
