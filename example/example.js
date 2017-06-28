let featureEditor, stepDefinitionsEditor, $output

function runFeature() {
  $output.empty()
  $('a[href="#output-tab"]').tab('show')

  let featureSource = featureEditor.getValue()
  let feature = Cucumber.FeatureParser.parse({
    scenarioFilter: new Cucumber.ScenarioFilter({}),
    source: featureSource,
    uri: '/feature'
  })

  Cucumber.clearSupportCodeFns()
  new Function(stepDefinitionsEditor.getValue())()
  let supportCodeLibrary = Cucumber.SupportCodeLibraryBuilder.build({
    cwd: '/',
    fns: Cucumber.getSupportCodeFns()
  })

  let formatterOptions = {
    colorsEnabled: true,
    cwd: '/',
    log(data) {
      appendToOutput(ansiHTML(data))
    },
    supportCodeLibrary
  }
  let prettyFormatter = Cucumber.FormatterBuilder.build(
    'pretty',
    formatterOptions
  )

  let runtime = new Cucumber.Runtime({
    features: [feature],
    listeners: [prettyFormatter],
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
