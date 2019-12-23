import { buildOptions, buildSupportCodeLibrary } from './runtime_helpers'
import { generateEvents } from './gherkin_helpers'
import Runtime, { IRuntimeOptions } from '../src/runtime'
import { EventEmitter } from 'events'
import { EventDataCollector } from '../src/formatter/helpers'
import FormatterBuilder from '../src/formatter/builder'
import { IdGenerator, messages } from 'cucumber-messages'
import { ISupportCodeLibrary } from '../src/support_code_library_builder/types'
import { ITestCaseAttempt } from '../src/formatter/helpers/event_data_collector'

const { uuid } = IdGenerator

export interface ITestSource {
  data: string
  uri: string
}

export interface ITestRunOptions {
  runtimeOptions?: Partial<IRuntimeOptions>
  supportCodeLibrary?: ISupportCodeLibrary
  sources?: ITestSource[]
}

export interface ITestFormatterOptions extends ITestRunOptions {
  formatterOptions?: any // TODO
  type: string
}

export interface IEnvelopesAndEventDataCollector {
  envelopes: messages.IEnvelope[]
  eventDataCollector: EventDataCollector
}

export async function testFormatter({
  formatterOptions = {},
  runtimeOptions = {},
  supportCodeLibrary,
  sources = [],
  type,
}: ITestFormatterOptions): Promise<string> {
  if (!supportCodeLibrary) {
    supportCodeLibrary = buildSupportCodeLibrary()
  }
  const eventBroadcaster = new EventEmitter()
  const eventDataCollector = new EventDataCollector(eventBroadcaster)
  let output = ''
  const logFn = data => {
    output += data
  }
  FormatterBuilder.build(type, {
    cwd: '',
    eventBroadcaster,
    eventDataCollector,
    log: logFn,
    supportCodeLibrary,
    ...formatterOptions,
  })
  let pickleIds = []
  for (const source of sources) {
    const { pickles } = await generateEvents({
      data: source.data,
      eventBroadcaster,
      uri: source.uri,
    })
    pickleIds = pickleIds.concat(pickles.map(p => p.id))
  }
  const runtime = new Runtime({
    eventBroadcaster,
    eventDataCollector,
    newId: uuid(),
    options: buildOptions(runtimeOptions),
    pickleIds,
    supportCodeLibrary,
  })

  await runtime.start()

  return output
}

export async function getTestCaseAttempts({
  runtimeOptions = {},
  supportCodeLibrary,
  sources = [],
}: ITestRunOptions): Promise<ITestCaseAttempt[]> {
  if (!supportCodeLibrary) {
    supportCodeLibrary = buildSupportCodeLibrary()
  }
  const eventBroadcaster = new EventEmitter()
  const eventDataCollector = new EventDataCollector(eventBroadcaster)
  let pickleIds = []
  for (const source of sources) {
    const { pickles } = await generateEvents({
      data: source.data,
      eventBroadcaster,
      uri: source.uri,
    })
    pickleIds = pickleIds.concat(pickles.map(p => p.id))
  }
  const runtime = new Runtime({
    eventBroadcaster,
    eventDataCollector,
    newId: uuid(),
    options: buildOptions(runtimeOptions),
    pickleIds,
    supportCodeLibrary,
  })

  await runtime.start()

  return eventDataCollector.getTestCaseAttempts()
}

export async function getEnvelopesAndEventDataCollector({
  runtimeOptions = {},
  supportCodeLibrary,
  sources = [],
}: ITestRunOptions): Promise<IEnvelopesAndEventDataCollector> {
  if (!supportCodeLibrary) {
    supportCodeLibrary = buildSupportCodeLibrary()
  }
  const eventBroadcaster = new EventEmitter()
  const eventDataCollector = new EventDataCollector(eventBroadcaster)
  const envelopes = []
  eventBroadcaster.on('envelope', envelope => envelopes.push(envelope))
  let pickleIds = []
  for (const source of sources) {
    const { pickles } = await generateEvents({
      data: source.data,
      eventBroadcaster,
      uri: source.uri,
    })
    pickleIds = pickleIds.concat(pickles.map(p => p.id))
  }
  const runtime = new Runtime({
    eventBroadcaster,
    eventDataCollector,
    newId: uuid(),
    options: buildOptions(runtimeOptions),
    pickleIds,
    supportCodeLibrary,
  })

  await runtime.start()

  return { envelopes, eventDataCollector }
}
