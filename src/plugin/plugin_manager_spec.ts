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

  it('wraps errors from custom plugin coordinator functions', async () => {
    const pluginManager = new PluginManager(usableEnvironment)
    const originalError = new Error('whoops')

    try {
      await pluginManager.initCoordinator(
        'runCucumber',
        {
          type: 'plugin',
          coordinator: () => {
            throw originalError
          },
        },
        {},
        './my-plugin.mjs'
      )
      expect.fail('Expected error to be thrown')
    } catch (error) {
      expect(error.message).to.equal(
        'Plugin "./my-plugin.mjs" errored when trying to init'
      )
      expect(error.cause).to.equal(originalError)
    }
  })

  it('does not wrap errors from internal plugin coordinator functions', async () => {
    const pluginManager = new PluginManager(usableEnvironment)
    const originalError = new Error('whoops')

    try {
      await pluginManager.initCoordinator(
        'runCucumber',
        {
          type: 'plugin',
          coordinator: () => {
            throw originalError
          },
        },
        {}
      )
      expect.fail('Expected error to be thrown')
    } catch (error) {
      expect(error).to.equal(originalError)
    }
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

    it('wraps errors from custom plugin event handlers', async () => {
      const pluginManager = new PluginManager(usableEnvironment)
      const originalError = new Error('handler failed')
      await pluginManager.initCoordinator(
        'runCucumber',
        {
          type: 'plugin',
          coordinator: ({ on }) =>
            on('message', () => {
              throw originalError
            }),
        },
        {},
        './my-plugin.mjs'
      )

      try {
        pluginManager.emit('message', {
          testRunStarted: {
            timestamp: { seconds: 1, nanos: 1 },
          },
        })
        expect.fail('Expected error to be thrown')
      } catch (error) {
        expect(error.message).to.equal(
          'Plugin "./my-plugin.mjs" errored when trying to handle a "message" event'
        )
        expect(error.cause).to.equal(originalError)
      }
    })

    it('does not wrap errors from internal plugin event handlers', async () => {
      const pluginManager = new PluginManager(usableEnvironment)
      const originalError = new Error('handler failed')
      await pluginManager.initCoordinator(
        'runCucumber',
        {
          type: 'plugin',
          coordinator: ({ on }) =>
            on('message', () => {
              throw originalError
            }),
        },
        {}
      )

      try {
        pluginManager.emit('message', {
          testRunStarted: {
            timestamp: { seconds: 1, nanos: 1 },
          },
        })
        expect.fail('Expected error to be thrown')
      } catch (error) {
        expect(error).to.equal(originalError)
      }
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
          coordinator: ({ transform }) => {
            // removes last item
            transform('pickles:filter', async (pickles) =>
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
          coordinator: ({ transform }) => {
            // removes pickle 3 if present
            transform('pickles:filter', (pickles) =>
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
          coordinator: ({ transform }) =>
            transform('pickles:filter', (): undefined => undefined),
        },
        {}
      )

      const result = await pluginManager.transform(
        'pickles:filter',
        filterablePickles
      )
      expect(result).to.eq(filterablePickles)
    })

    it('wraps errors from custom plugin transformers', async () => {
      const pluginManager = new PluginManager(usableEnvironment)
      const originalError = new Error('transformer failed')
      await pluginManager.initCoordinator(
        'runCucumber',
        {
          type: 'plugin',
          coordinator: ({ transform }) =>
            transform('pickles:filter', () => {
              throw originalError
            }),
        },
        {},
        './my-plugin.mjs'
      )

      try {
        await pluginManager.transform('pickles:filter', filterablePickles)
        expect.fail('Expected error to be thrown')
      } catch (error) {
        expect(error.message).to.equal(
          'Plugin "./my-plugin.mjs" errored when trying to do a "pickles:filter" transform'
        )
        expect(error.cause).to.equal(originalError)
      }
    })

    it('does not wrap errors from internal plugin transformers', async () => {
      const pluginManager = new PluginManager(usableEnvironment)
      const originalError = new Error('transformer failed')
      await pluginManager.initCoordinator(
        'runCucumber',
        {
          type: 'plugin',
          coordinator: ({ transform }) =>
            transform('pickles:filter', () => {
              throw originalError
            }),
        },
        {}
      )

      try {
        await pluginManager.transform('pickles:filter', filterablePickles)
        expect.fail('Expected error to be thrown')
      } catch (error) {
        expect(error).to.equal(originalError)
      }
    })
  })

  describe('cleanup', () => {
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

    it('wraps errors from custom plugin cleanup functions', async () => {
      const pluginManager = new PluginManager(usableEnvironment)
      const originalError = new Error('cleanup failed')
      await pluginManager.initCoordinator(
        'runCucumber',
        {
          type: 'plugin',
          coordinator: () => () => {
            throw originalError
          },
        },
        {},
        './my-plugin.mjs'
      )

      try {
        await pluginManager.cleanup()
        expect.fail('Expected error to be thrown')
      } catch (error) {
        expect(error.message).to.equal(
          'Plugin "./my-plugin.mjs" errored when trying to cleanup'
        )
        expect(error.cause).to.equal(originalError)
      }
    })

    it('does not wrap errors from internal plugin cleanup functions', async () => {
      const pluginManager = new PluginManager(usableEnvironment)
      const originalError = new Error('cleanup failed')
      await pluginManager.initCoordinator(
        'runCucumber',
        {
          type: 'plugin',
          coordinator: () => () => {
            throw originalError
          },
        },
        {}
      )

      try {
        await pluginManager.cleanup()
        expect.fail('Expected error to be thrown')
      } catch (error) {
        expect(error).to.equal(originalError)
      }
    })
  })
})
