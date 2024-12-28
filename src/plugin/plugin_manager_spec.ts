import sinon from 'sinon'
import { expect } from 'chai'
import { FakeLogger } from '../../test/fake_logger'
import { IFilterablePickle } from '../filter'
import { UsableEnvironment } from '../environment'
import { PluginManager } from './plugin_manager'

describe('PluginManager', () => {
  const usableEnvironment: UsableEnvironment = {
    cwd: 'cwd',
    stdout: process.stdout,
    stderr: process.stderr,
    env: {},
    debug: false,
    logger: new FakeLogger(),
  }

  it('passes the correct context to the coordinator function', async () => {
    const pluginManager = new PluginManager(usableEnvironment)
    const coordinator = sinon.fake()
    await pluginManager.initCoordinator(
      'runCucumber',
      {
        type: 'plugin',
        coordinator,
      },
      {}
    )

    expect(coordinator).to.have.been.calledOnce
    expect(coordinator.lastCall.firstArg.operation).to.eq('runCucumber')
    expect(coordinator.lastCall.firstArg.on).to.exist
    expect(coordinator.lastCall.firstArg.options).to.deep.eq({})
    expect(coordinator.lastCall.firstArg.logger).to.eq(usableEnvironment.logger)
    expect(Object.keys(coordinator.lastCall.firstArg.environment)).to.deep.eq([
      'cwd',
      'stderr',
      'env',
    ])
  })

  it('calls cleanup functions from all plugins', async () => {
    const pluginManager = new PluginManager(usableEnvironment)
    const cleanup1 = sinon.fake()
    const cleanup2 = sinon.fake()
    await pluginManager.initCoordinator(
      'runCucumber',
      {
        type: 'plugin',
        coordinator: () => cleanup1,
      },
      {}
    )
    await pluginManager.initCoordinator(
      'runCucumber',
      {
        type: 'plugin',
        coordinator: () => cleanup2,
      },
      {}
    )

    await pluginManager.cleanup()

    expect(cleanup1).to.have.been.calledOnce
    expect(cleanup2).to.have.been.calledOnce
  })

  describe('void events', () => {
    it(`emits void event to all handlers`, async () => {
      const pluginManager = new PluginManager(usableEnvironment)
      const handler1 = sinon.fake()
      const handler2 = sinon.fake()
      await pluginManager.initCoordinator(
        'runCucumber',
        {
          type: 'plugin',
          coordinator: ({ on }) => on('message', handler1),
        },
        {}
      )
      await pluginManager.initCoordinator(
        'runCucumber',
        {
          type: 'plugin',
          coordinator: ({ on }) => on('message', handler2),
        },
        {}
      )

      const value = {
        testRunStarted: {
          timestamp: {
            seconds: 1,
            nanos: 1,
          },
        },
      }
      pluginManager.emit('message', value)

      expect(handler1).to.have.been.calledOnceWith(value)
      expect(handler2).to.have.been.calledOnceWith(value)
    })
  })

  describe('transforms', () => {
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

    it('should apply transforms in the order registered', async () => {
      const pluginManager = new PluginManager(usableEnvironment)
      await pluginManager.initCoordinator(
        'runCucumber',
        {
          type: 'plugin',
          coordinator: ({ on }) => {
            // removes last item
            on('pickles:filter', async (pickles) =>
              pickles.slice(0, pickles.length - 1)
            )
          },
        },
        {}
      )
      await pluginManager.initCoordinator(
        'runCucumber',
        {
          type: 'plugin',
          coordinator: ({ on }) => {
            // removes pickle 3 if present
            on('pickles:filter', (pickles) =>
              pickles.filter(({ pickle }) => pickle.id !== 'pickle-3')
            )
          },
        },
        {}
      )

      const result = await pluginManager.transform(
        'pickles:filter',
        filterablePickles
      )
      expect(result).to.have.length(2)
    })

    it('should treat undefined as a noop', async () => {
      const pluginManager = new PluginManager(usableEnvironment)
      await pluginManager.initCoordinator(
        'runCucumber',
        {
          type: 'plugin',
          // bail, nothing to be done
          coordinator: ({ on }) => on('pickles:filter', () => undefined),
        },
        {}
      )

      const result = await pluginManager.transform(
        'pickles:filter',
        filterablePickles
      )
      expect(result).to.eq(filterablePickles)
    })
  })
})
