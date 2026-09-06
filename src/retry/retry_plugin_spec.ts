import {
  type GherkinDocument,
  type Pickle,
  type TestCase,
  TestStepResultStatus,
  TimeConversion,
} from '@cucumber/messages'
import { expect } from 'chai'
import { describe, it } from 'mocha'
import { FakeLogger } from '../../test/fake_logger'
import { getPickleWithTags } from '../../test/gherkin_helpers'
import type { UsableEnvironment } from '../environment'
import { type IRetryCandidate, PluginManager } from '../plugin'
import { retryPlugin } from './retry_plugin'

const usableEnvironment: UsableEnvironment = {
  cwd: 'cwd',
  stdout: process.stdout,
  stderr: process.stderr,
  env: {},
  debug: false,
  logger: new FakeLogger(),
}

async function makeDecider(options: { retry: number; retryTagFilter: string }) {
  const pluginManager = new PluginManager(usableEnvironment)
  await pluginManager.initCoordinatorInternal('runCucumber', retryPlugin, options)
  return (pickle: Pickle, attempt: number, willBeRetried = false) =>
    pluginManager.transform('testCase:retry', willBeRetried, makeCandidate(pickle, attempt))
}

function makeCandidate(pickle: Pickle, attempt: number): IRetryCandidate {
  return {
    gherkinDocument: {} as GherkinDocument,
    pickle,
    testCase: { id: 'test-case' } as TestCase,
    testCaseStartedId: 'test-case-started',
    attempt,
    result: {
      status: TestStepResultStatus.FAILED,
      duration: TimeConversion.millisecondsToDuration(0),
    },
  }
}

describe('retryPlugin', () => {
  it('does not grant a retry if retry is not set', async () => {
    const pickle = await getPickleWithTags([])
    const decide = await makeDecider({ retry: 0, retryTagFilter: '' })

    expect(await decide(pickle, 0)).to.eql(false)
  })

  it('grants retry extra attempts if set and no retryTagFilter is specified', async () => {
    const pickle = await getPickleWithTags([])
    const decide = await makeDecider({ retry: 2, retryTagFilter: '' })

    expect(await decide(pickle, 0)).to.eql(true)
    expect(await decide(pickle, 1)).to.eql(true)
    expect(await decide(pickle, 2)).to.eql(false)
  })

  it('grants retry extra attempts if the pickle tags match retryTagFilter', async () => {
    const pickle = await getPickleWithTags(['@retry'])
    const decide = await makeDecider({ retry: 1, retryTagFilter: '@retry' })

    expect(await decide(pickle, 0)).to.eql(true)
    expect(await decide(pickle, 1)).to.eql(false)
  })

  it('does not grant a retry if the pickle tags do not match retryTagFilter', async () => {
    const pickle = await getPickleWithTags([])
    const decide = await makeDecider({ retry: 1, retryTagFilter: '@retry' })

    expect(await decide(pickle, 0)).to.eql(false)
  })

  it('passes through a prior decision when it has no opinion', async () => {
    const pickle = await getPickleWithTags([])
    const decide = await makeDecider({ retry: 1, retryTagFilter: '@retry' })

    expect(await decide(pickle, 0, true)).to.eql(true)
  })
})
