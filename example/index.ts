import { EventEmitter } from 'events'
import ansiHTML from 'ansi-html'
import Gherkin from 'gherkin'
import { messages, IdGenerator } from 'cucumber-messages'

declare var Cucumber: any
declare var $: any
declare var ace: any
declare var window: any

const { uuid } = IdGenerator

let featureEditor: any, stepDefinitionsEditor: any, $output: any

async function runFeature(): Promise<boolean> {
  $output.empty()
  $('a[href="#output-tab"]').tab('show')

  const eventBroadcaster = new EventEmitter()
  const eventDataCollector = new Cucumber.formatterHelpers.EventDataCollector(
    eventBroadcaster
  )

  const newId = uuid()
  const gherkinMessageStream = Gherkin.fromSources(
    [
      messages.Envelope.fromObject({
        source: {
          data: featureEditor.getValue(),
          uri: 'example.feature',
        },
      }),
    ],
    { newId }
  )
  const pickleIds = Cucumber.parseGherkinMessageStream({
    cwd: '',
    eventBroadcaster,
    eventDataCollector,
    gherkinMessageStream,
    pickleFilter: new Cucumber.PickleFilter({ cwd: '' }),
    order: 'defined',
  })

  Cucumber.supportCodeLibraryBuilder.reset('', newId)
  new Function(stepDefinitionsEditor.getValue())() // eslint-disable-line no-new-func, @typescript-eslint/no-implied-eval
  const supportCodeLibrary = await Cucumber.supportCodeLibraryBuilder.finalize()

  const formatterOptions = {
    cwd: '/',
    eventBroadcaster,
    eventDataCollector,
    parsedArgvOptions: {
      colorsEnabled: true,
    },
    log(data: string) {
      appendToOutput(ansiHTML(data))
    },
    supportCodeLibrary,
  }
  Cucumber.FormatterBuilder.build('progress', formatterOptions)

  const runtime = new Cucumber.Runtime({
    eventBroadcaster,
    eventDataCollector,
    newId,
    options: {},
    pickleIds,
    supportCodeLibrary,
  })
  return runtime.start()
}

function appendToOutput(data: string): void {
  $output.append(data)
  $output.scrollTop($output.prop('scrollHeight'))
}

function displayError(error: Error): void {
  const errorContainer = $('<div>')
  errorContainer.addClass('error').text(error.stack)
  appendToOutput(errorContainer)
}

$(() => {
  featureEditor = ace.edit('feature')
  featureEditor.getSession().setMode('ace/mode/gherkin')

  stepDefinitionsEditor = ace.edit('step-definitions')
  stepDefinitionsEditor.getSession().setMode('ace/mode/javascript')

  $output = $('#output')

  window.onerror = displayError

  $('#run-feature').click(() => {
    runFeature()
      .then(success => {
        const exitStatus = success ? '0' : '1'
        const exitStatusContainer = $('<div>')
        exitStatusContainer
          .addClass('exit-status')
          .text(`Exit Status: ${exitStatus}`)
        appendToOutput(exitStatusContainer)
      })
      .catch(displayError)
  })
})
