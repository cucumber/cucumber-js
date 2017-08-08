/* global $, ace, Cucumber */
import { EventEmitter } from 'events'
import ansiHTML from 'ansi-html'

let featureEditor, stepDefinitionsEditor, $output

function runFeature() {
  $output.empty()
  $('a[href="#output-tab"]').tab('show')

  const eventBroadcaster = new EventEmitter()
  const eventDataCollector = new Cucumber.formatterHelpers.EventDataCollector(
    eventBroadcaster
  )

  let featureSource = featureEditor.getValue()
  const testCases = Cucumber.getTestCases({
    eventBroadcaster,
    pickleFilter: new Cucumber.PickleFilter({}),
    source: featureSource,
    uri: '/feature'
  })

  Cucumber.supportCodeLibraryBuilder.reset('')
  new Function(stepDefinitionsEditor.getValue())()
  let supportCodeLibrary = Cucumber.supportCodeLibraryBuilder.finalize()

  let formatterOptions = {
    colorsEnabled: true,
    cwd: '/',
    eventBroadcaster,
    eventDataCollector,
    log(data) {
      appendToOutput(ansiHTML(data))
    },
    supportCodeLibrary
  }
  Cucumber.FormatterBuilder.build('progress', formatterOptions)

  let runtime = new Cucumber.Runtime({
    eventBroadcaster,
    options: {},
    testCases,
    supportCodeLibrary
  })
  return runtime.start()
}

function appendToOutput(data) {
  $output.append(data)
  $output.scrollTop($output.prop('scrollHeight'))
}

function displayError(error) {
  let errorContainer = $('<div>')
  errorContainer.addClass('error').text(error.stack || error)
  appendToOutput(errorContainer)
}

$(function() {
  featureEditor = ace.edit('feature')
  featureEditor.getSession().setMode('ace/mode/gherkin')

  stepDefinitionsEditor = ace.edit('step-definitions')
  stepDefinitionsEditor.getSession().setMode('ace/mode/javascript')

  $output = $('#output')

  window.onerror = displayError

  $('#run-feature').click(function() {
    runFeature()
      .then(function(success) {
        let exitStatus = success ? '0' : '1'
        let exitStatusContainer = $('<div>')
        exitStatusContainer
          .addClass('exit-status')
          .text('Exit Status: ' + exitStatus)
        appendToOutput(exitStatusContainer)
      })
      .catch(displayError)
  })
})
