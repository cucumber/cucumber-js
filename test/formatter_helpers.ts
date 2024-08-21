import { EventEmitter } from 'node:events'
import { PassThrough } from 'node:stream'
import { promisify } from 'node:util'
import { IdGenerator } from '@cucumber/messages'
import * as messages from '@cucumber/messages'
import { Coordinator, RuntimeOptions } from '../src/runtime'
import { EventDataCollector } from '../src/formatter/helpers'
import FormatterBuilder from '../src/formatter/builder'
import { SupportCodeLibrary } from '../src/support_code_library_builder/types'
import { ITestCaseAttempt } from '../src/formatter/helpers/event_data_collector'
import { doesNotHaveValue } from '../src/value_checker'
import { emitSupportCodeMessages } from '../src/cli/helpers'
import { FormatOptions } from '../src/formatter'
import { InProcessAdapter } from '../src/runtime/serial/adapter'
import { SourcedPickle } from '../src/assemble'
import { generatePickles } from './gherkin_helpers'
import { buildOptions, buildSupportCodeLibrary } from './runtime_helpers'

const { uuid } = IdGenerator

export interface ITestSource {
  data: string
  uri: string
}

export interface ITestRunOptions {
  runtimeOptions?: Partial<RuntimeOptions>
  supportCodeLibrary?: SupportCodeLibrary
  sources?: ITestSource[]
  pickleFilter?: (pickle: messages.Pickle) => boolean
}

export interface ITestFormatterOptions extends ITestRunOptions {
  parsedArgvOptions?: FormatOptions
  type: string
}

export interface IEnvelopesAndEventDataCollector {
  envelopes: messages.Envelope[]
  eventDataCollector: EventDataCollector
}

export async function testFormatter({
  parsedArgvOptions = {},
  runtimeOptions = {},
  supportCodeLibrary,
  sources = [],
  type,
}: ITestFormatterOptions): Promise<string> {
  if (doesNotHaveValue(supportCodeLibrary)) {
    supportCodeLibrary = buildSupportCodeLibrary()
  }
  const eventBroadcaster = new EventEmitter()
  const eventDataCollector = new EventDataCollector(eventBroadcaster)
  emitSupportCodeMessages({
    supportCodeLibrary,
    eventBroadcaster,
    newId: uuid(),
  })
  let output = ''
  const logFn = (data: string): void => {
    output += data
  }
  const passThrough = new PassThrough()
  await FormatterBuilder.build(type, {
    env: {},
    cwd: '',
    eventBroadcaster,
    eventDataCollector,
    log: logFn,
    parsedArgvOptions,
    stream: passThrough,
    cleanup: promisify(passThrough.end.bind(passThrough)),
    supportCodeLibrary,
  })
  let filteredPickles: SourcedPickle[] = []
  for (const source of sources) {
    const generated = await generatePickles({
      data: source.data,
      eventBroadcaster,
      uri: source.uri,
    })
    filteredPickles = filteredPickles.concat(generated)
  }
  const runtime = new Coordinator(
    eventBroadcaster,
    uuid(),
    filteredPickles,
    supportCodeLibrary,
    new InProcessAdapter(
      eventBroadcaster,
      uuid(),
      buildOptions(runtimeOptions),
      supportCodeLibrary
    )
  )

  await runtime.run()

  return normalizeSummaryDuration(output)
}

export async function getTestCaseAttempts({
  runtimeOptions = {},
  supportCodeLibrary,
  sources = [],
}: ITestRunOptions): Promise<ITestCaseAttempt[]> {
  if (doesNotHaveValue(supportCodeLibrary)) {
    supportCodeLibrary = buildSupportCodeLibrary()
  }
  const eventBroadcaster = new EventEmitter()
  const eventDataCollector = new EventDataCollector(eventBroadcaster)
  let filteredPickles: SourcedPickle[] = []
  for (const source of sources) {
    const generated = await generatePickles({
      data: source.data,
      eventBroadcaster,
      uri: source.uri,
    })
    filteredPickles = filteredPickles.concat(generated)
  }
  const runtime = new Coordinator(
    eventBroadcaster,
    uuid(),
    filteredPickles,
    supportCodeLibrary,
    new InProcessAdapter(
      eventBroadcaster,
      uuid(),
      buildOptions(runtimeOptions),
      supportCodeLibrary
    )
  )

  await runtime.run()

  return eventDataCollector.getTestCaseAttempts()
}

export async function getEnvelopesAndEventDataCollector({
  runtimeOptions = {},
  supportCodeLibrary,
  sources = [],
  pickleFilter = () => true,
}: ITestRunOptions): Promise<IEnvelopesAndEventDataCollector> {
  if (doesNotHaveValue(supportCodeLibrary)) {
    supportCodeLibrary = buildSupportCodeLibrary()
  }
  const eventBroadcaster = new EventEmitter()
  const eventDataCollector = new EventDataCollector(eventBroadcaster)
  const envelopes: messages.Envelope[] = []
  eventBroadcaster.on('envelope', (envelope) => envelopes.push(envelope))
  emitSupportCodeMessages({
    supportCodeLibrary,
    eventBroadcaster,
    newId: IdGenerator.uuid(),
  })
  let filteredPickles: SourcedPickle[] = []

  for (const source of sources) {
    const generated = await generatePickles({
      data: source.data,
      eventBroadcaster,
      uri: source.uri,
    })
    filteredPickles = filteredPickles.concat(
      generated.filter((item) => pickleFilter(item.pickle))
    )
  }

  const runtime = new Coordinator(
    eventBroadcaster,
    uuid(),
    filteredPickles,
    supportCodeLibrary,
    new InProcessAdapter(
      eventBroadcaster,
      uuid(),
      buildOptions(runtimeOptions),
      supportCodeLibrary
    )
  )

  await runtime.run()

  return { envelopes, eventDataCollector }
}

export function normalizeSummaryDuration(output: string): string {
  return output.replace(
    /\d+m\d{2}\.\d{3}s \(executing steps: \d+m\d{2}\.\d{3}s\)/,
    '<duration-stat>'
  )
}
