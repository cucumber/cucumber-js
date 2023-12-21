import path from 'node:path'
import { PassThrough } from 'node:stream'
import { expect } from 'chai'
import fs from 'mz/fs'
import { IdGenerator } from '@cucumber/messages'
import { IRunEnvironment } from './types'
import { loadSources } from './load_sources'

const newId = IdGenerator.uuid()

async function setupEnvironment(): Promise<Partial<IRunEnvironment>> {
  const cwd = path.join(__dirname, '..', '..', 'tmp', `loadSources_${newId()}`)
  await fs.mkdir(path.join(cwd, 'features'), { recursive: true })
  await fs.writeFile(
    path.join(cwd, 'features', 'test.feature'),
    `@tag1
Feature: test fixture
  Scenario: one
    Given a step
    Then another step
  
  @tag2
  Scenario: two
    Given a step
    Then another step
    
  Scenario: three
    Given a step
    Then another step
    
  Scenario Outline: four with <param>
    Given a step
    Then another step\`
  Examples:
    | param |
    | foo   |
    | bar   |`
  )
  await fs.writeFile(path.join(cwd, '@rerun.txt'), 'features/test.feature:8')
  const stdout = new PassThrough()
  return { cwd, stdout }
}

describe('loadSources', () => {
  it('should produce a plan with all pickles', async () => {
    const environment = await setupEnvironment()
    const { plan } = await loadSources(
      {
        defaultDialect: 'en',
        order: 'defined',
        paths: [],
        names: [],
        tagExpression: '',
      },
      environment
    )
    expect(
      plan.map((planned) => ({
        ...planned,
        uri: planned.uri.replace(/\\/g, '/'),
      }))
    ).to.deep.eq([
      {
        name: 'one',
        uri: 'features/test.feature',
        location: {
          line: 3,
          column: 3,
        },
      },
      {
        name: 'two',
        uri: 'features/test.feature',
        location: {
          line: 8,
          column: 3,
        },
      },
      {
        name: 'three',
        uri: 'features/test.feature',
        location: {
          line: 12,
          column: 3,
        },
      },
      {
        name: 'four with foo',
        uri: 'features/test.feature',
        location: {
          line: 21,
          column: 5,
        },
      },
      {
        name: 'four with bar',
        uri: 'features/test.feature',
        location: {
          line: 22,
          column: 5,
        },
      },
    ])
  })

  it('should produce a plan with pickles filtered by path:line', async () => {
    const environment = await setupEnvironment()
    const { plan } = await loadSources(
      {
        defaultDialect: 'en',
        order: 'defined',
        paths: ['features/test.feature:8'],
        names: [],
        tagExpression: '',
      },
      environment
    )
    expect(plan.map((pickle) => pickle.name)).to.deep.eq(['two'])
  })

  it('should produce a plan with pickles filtered by name', async () => {
    const environment = await setupEnvironment()
    const { plan } = await loadSources(
      {
        defaultDialect: 'en',
        order: 'defined',
        paths: [],
        names: ['two'],
        tagExpression: '',
      },
      environment
    )
    expect(plan.map((pickle) => pickle.name)).to.deep.eq(['two'])
  })

  it('should produce a plan with pickles filtered by tags', async () => {
    const environment = await setupEnvironment()
    const { plan } = await loadSources(
      {
        defaultDialect: 'en',
        order: 'defined',
        paths: [],
        names: [],
        tagExpression: '@tag2',
      },
      environment
    )
    expect(plan.map((pickle) => pickle.name)).to.deep.eq(['two'])
  })

  it('should produce a plan based on a rerun file', async () => {
    const environment = await setupEnvironment()
    const { plan } = await loadSources(
      {
        defaultDialect: 'en',
        order: 'defined',
        paths: ['@rerun.txt'],
        names: [],
        tagExpression: '',
      },
      environment
    )
    expect(plan.map((pickle) => pickle.name)).to.deep.eq(['two'])
  })
})
