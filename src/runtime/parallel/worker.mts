import { EventEmitter } from 'node:events'
import { register } from 'node:module'
import { pathToFileURL } from 'node:url'
import { workerData } from 'node:worker_threads'
import { type Envelope, IdGenerator } from '@cucumber/messages'
import FormatterBuilder from '../../formatter/builder.js'
import supportCodeLibraryBuilder from '../../support_code_library_builder/index.js'
import { HookTarget } from '../../support_code_library_builder/types.js'
import tryRequire from '../../try_require.js'
import { Executor } from '../executor.js'
import type { WorkerCommand, WorkerData, WorkerEvent } from './types.js'

const {
  cwd,
  testRunStartedId,
  supportCodeCoordinates,
  supportCodeIds,
  options,
  snippetOptions,
  port,
} = workerData as WorkerData
const newId = IdGenerator.uuid()

supportCodeLibraryBuilder.default.reset(cwd, newId, supportCodeCoordinates)
supportCodeCoordinates.requireModules.map((module) => tryRequire.default(module))
supportCodeCoordinates.requirePaths.map((module) => tryRequire.default(module))
for (const specifier of supportCodeCoordinates.loaders) {
  register(specifier, pathToFileURL('./'))
}
for (const path of supportCodeCoordinates.importPaths) {
  await import(pathToFileURL(path).toString())
}
const supportCodeLibrary = supportCodeLibraryBuilder.default.finalize(supportCodeIds)
const snippetBuilder = await FormatterBuilder.default.getStepDefinitionSnippetBuilder({
  cwd,
  snippetInterface: snippetOptions.snippetInterface,
  snippetSyntax: snippetOptions.snippetSyntax,
  supportCodeLibrary,
})

const eventBroadcaster = new EventEmitter()
eventBroadcaster.on('envelope', (envelope: Envelope) =>
  port.postMessage({
    type: 'ENVELOPE',
    envelope,
  } satisfies WorkerEvent)
)

const executor = new Executor(
  testRunStartedId,
  process.env.CUCUMBER_WORKER_ID,
  eventBroadcaster,
  IdGenerator.uuid(),
  options,
  supportCodeLibrary,
  snippetBuilder
)

port.on('message', (command: WorkerCommand) => {
  switch (command.type) {
    case 'BEFOREALL_HOOKS':
      executor
        .runBeforeAllHooks((hook) => hook.on === HookTarget.WORKER)
        .then((success) => {
          port.postMessage({
            type: 'FINISHED',
            success,
          } satisfies WorkerEvent)
        })
      break
    case 'TEST_CASE':
      executor.runTestCase(command.assembledTestCase, command.failing).then((success) => {
        port.postMessage({
          type: 'FINISHED',
          success,
        } satisfies WorkerEvent)
      })
      break
    case 'AFTERALL_HOOKS':
      executor
        .runAfterAllHooks((hook) => hook.on === HookTarget.WORKER)
        .then((success) => {
          port.postMessage({
            type: 'FINISHED',
            success,
          } satisfies WorkerEvent)
        })
      break
  }
})

port.postMessage({
  type: 'READY',
} satisfies WorkerEvent)
