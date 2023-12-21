import sinon from 'sinon'
import { expect } from 'chai'
import { IRunEnvironment } from '../api'
import { ILogger } from '../logger'
import { FakeLogger } from '../../test/fake_logger'
import { IFilterablePickle } from '../filter'
import { PluginManager } from './plugin_manager'

describe('PluginManager', () => {
  const environment: Required<IRunEnvironment> = {
    cwd: 'cwd',
    stdout: process.stdout,
    stderr: process.stderr,
    env: {},
    debug: false,
  }
  const logger: ILogger = new FakeLogger()

  it('passes the correct context to the coordinator function', async () => {
    const pluginManager = new PluginManager()
    const coordinator = sinon.fake()
    await pluginManager.init(
      'runCucumber',
      {
        type: 'plugin',
        coordinator,
      },
      {},
      logger,
      environment
    )

    expect(coordinator).to.have.been.calledOnce
    expect(coordinator.lastCall.firstArg.operation).to.eq('runCucumber')
    expect(coordinator.lastCall.firstArg.on).to.exist
    expect(coordinator.lastCall.firstArg.options).to.deep.eq({})
    expect(coordinator.lastCall.firstArg.logger).to.eq(logger)
    expect(coordinator.lastCall.firstArg.environment).to.eq(environment)
  })

  it('calls cleanup functions from all plugins', async () => {
    const pluginManager = new PluginManager()
    const cleanup1 = sinon.fake()
    const cleanup2 = sinon.fake()
    await pluginManager.init(
      'runCucumber',
      {
        type: 'plugin',
        coordinator: () => cleanup1,
      },
      {},
      logger,
      environment
    )
    await pluginManager.init(
      'runCucumber',
      {
        type: 'plugin',
        coordinator: () => cleanup2,
      },
      {},
      logger,
      environment
    )

    await pluginManager.cleanup()

    expect(cleanup1).to.have.been.calledOnce
    expect(cleanup2).to.have.been.calledOnce
  })

  describe('void events', () => {
    const variants = [
      {
        key: 'message',
        value: {
          testRunStarted: {
            timestamp: {
              seconds: 1,
              nanos: 1,
            },
          },
        },
      },
      {
        key: 'paths:resolve',
        value: {
          unexpandedSourcePaths: [],
          sourcePaths: [],
          requirePaths: [],
          importPaths: [],
        },
      },
    ] as const

    for (const { key, value } of variants) {
      it(`emits ${key} event to all handlers`, async () => {
        const pluginManager = new PluginManager()
        const handler1 = sinon.fake()
        const handler2 = sinon.fake()
        await pluginManager.init(
          'runCucumber',
          {
            type: 'plugin',
            coordinator: ({ on }) => {
              on(key, handler1)
            },
          },
          {},
          logger,
          environment
        )
        await pluginManager.init(
          'runCucumber',
          {
            type: 'plugin',
            coordinator: ({ on }) => {
              on(key, handler2)
            },
          },
          {},
          logger,
          environment
        )

        // @ts-expect-error type gymnastics aren't worth it here
        pluginManager.emit(key, value)

        expect(handler1).to.have.been.calledOnceWith(value)
        expect(handler2).to.have.been.calledOnceWith(value)
      })
    }
  })

  describe('transforms', () => {
    it('should apply transforms in the order registered', async () => {
      const pluginManager = new PluginManager()
      await pluginManager.init(
        'runCucumber',
        {
          type: 'plugin',
          coordinator: ({ on }) => {
            on('pickles:filter', async (pickles) => {
              // removes last item
              return pickles.slice(0, pickles.length - 1)
            })
          },
        },
        {},
        logger,
        environment
      )
      await pluginManager.init(
        'runCucumber',
        {
          type: 'plugin',
          coordinator: ({ on }) => {
            on('pickles:filter', (pickles) => {
              // removes third item if present
              return pickles.filter(({ pickle }) => pickle.id !== 'pickle-3')
            })
          },
        },
        {},
        logger,
        environment
      )

      const filterablePickles = [
        {
          pickle: {
            id: 'pickle-1',
          },
        },
        {
          pickle: {
            id: 'pickle-2',
          },
        },
        {
          pickle: {
            id: 'pickle-3',
          },
        },
      ] as IFilterablePickle[]

      const result = await pluginManager.transform(
        'pickles:filter',
        filterablePickles
      )
      expect(result).to.have.length(2)
    })
  })
})
