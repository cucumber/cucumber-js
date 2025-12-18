import { parentPort, workerData } from 'node:worker_threads'
import { EventEmitter } from 'node:events'
import { register } from 'node:module'
import { pathToFileURL } from 'node:url'
import { Envelope, IdGenerator } from '@cucumber/messages'
import { Worker } from '../../worker.js'
import supportCodeLibraryBuilder from '../../../support_code_library_builder/index.js'
import tryRequire from '../../../try_require.js'
import FormatterBuilder from '../../../formatter/builder.js'
import { WorkerCommand, WorkerData, WorkerEvent } from './types.js'

const {
  cwd,
  testRunStartedId,
  supportCodeCoordinates,
  supportCodeIds,
  options,
  snippetOptions,
} = workerData as WorkerData
const newId = IdGenerator.uuid()

supportCodeLibraryBuilder.default.reset(cwd, newId, supportCodeCoordinates)
supportCodeCoordinates.requireModules.map((module) =>
  tryRequire.default(module)
)
supportCodeCoordinates.requirePaths.map((module) => tryRequire.default(module))
for (const specifier of supportCodeCoordinates.loaders) {
  register(specifier, pathToFileURL('./'))
}
for (const path of supportCodeCoordinates.importPaths) {
  await import(pathToFileURL(path).toString())
}
const supportCodeLibrary =
  supportCodeLibraryBuilder.default.finalize(supportCodeIds)
const snippetBuilder =
  await FormatterBuilder.default.getStepDefinitionSnippetBuilder({
    cwd,
    snippetInterface: snippetOptions.snippetInterface,
    snippetSyntax: snippetOptions.snippetSyntax,
    supportCodeLibrary,
  })

const eventBroadcaster = new EventEmitter()
eventBroadcaster.on('envelope', (envelope: Envelope) =>
  parentPort.postMessage({
    type: 'ENVELOPE',
    envelope,
  } satisfies WorkerEvent)
)

const worker = new Worker(
  testRunStartedId,
  process.env.CUCUMBER_WORKER_ID,
  eventBroadcaster,
  IdGenerator.uuid(),
  options,
  supportCodeLibrary,
  snippetBuilder
)

parentPort.on('message', (command: WorkerCommand) => {
  switch (command.type) {
    case 'BEFOREALL_HOOKS':
      worker.runBeforeAllHooks().then((success) => {
        parentPort.postMessage({
          type: 'FINISHED',
          success,
        } satisfies WorkerEvent)
      })
      break
    case 'TEST_CASE':
      worker
        .runTestCase(command.assembledTestCase, command.failing)
        .then((success) => {
          parentPort.postMessage({
            type: 'FINISHED',
            success,
          } satisfies WorkerEvent)
        })
      break
    case 'AFTERALL_HOOKS':
      worker.runAfterAllHooks().then((success) => {
        parentPort.postMessage({
          type: 'FINISHED',
          success,
        } satisfies WorkerEvent)
      })
      break
  }
})

parentPort.postMessage({
  type: 'READY',
} satisfies WorkerEvent)
