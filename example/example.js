var featureEditor, stepDefinitionsEditor, $output;

function runFeature() {
  $output.empty();
  $('a[href="#output-tab"]').tab('show');

  var featureSource = featureEditor.getValue();
  var feature = Cucumber.FeatureParser.parse({
    scenarioFilter: new Cucumber.ScenarioFilter({}),
    source: featureSource,
    uri: '/feature'
  });

  Cucumber.clearSupportCodeFns();
  new Function(stepDefinitionsEditor.getValue())();
  var supportCodeLibrary = Cucumber.SupportCodeLibraryBuilder.build({
    cwd: '/',
    fns: Cucumber.getSupportCodeFns()
  });

  var formatterOptions = {
    colorsEnabled: true,
    cwd: '/',
    log: function(data) {
      appendToOutput(ansi_up.ansi_to_html(data));
    },
    supportCodeLibrary: supportCodeLibrary
  };
  var prettyFormatter = Cucumber.FormatterBuilder.build('pretty', formatterOptions);

  var runtime = new Cucumber.Runtime({
    features: [feature],
    listeners: [prettyFormatter],
    supportCodeLibrary: supportCodeLibrary
  });
  return runtime.start();
};

function appendToOutput(data) {
  $output.append(data);
  $output.scrollTop($output.prop("scrollHeight"));
}

function displayError(error) {
  var errorContainer = $('<div>')
  errorContainer.addClass('error').text(error.stack || error);
  appendToOutput(errorContainer)
}

$(function() {
  featureEditor = ace.edit("feature");
  featureEditor.getSession().setMode("ace/mode/gherkin");

  stepDefinitionsEditor = ace.edit("step-definitions");
  stepDefinitionsEditor.getSession().setMode("ace/mode/javascript");

  $output = $('#output');

  window.onerror = displayError;

  $('#run-feature').click(function() {
    runFeature().then(function(success) {
      var exitStatus = success ? '0' : '1';
      var exitStatusContainer = $('<div>');
      exitStatusContainer.addClass('exit-status').text('Exit Status: ' + exitStatus);
      appendToOutput(exitStatusContainer);
    }).catch(displayError);
  });
});
