var featureEditor, stepDefinitionsEditor;
var Cucumber = Cucumber.default;

function runFeature() {
  var $output = $('#output');
  $output.empty();
  $('a[href="#output-tab"]').tab('show');

  var featureSource = featureEditor.getValue();
  var feature = Cucumber.FeatureParser.parse({
    scenarioFilter: new Cucumber.ScenarioFilter({}),
    source: featureSource,
    uri: '/feature'
  });

  var supportCode = new Function(stepDefinitionsEditor.getValue());
  var supportCodeLibrary = Cucumber.SupportCodeLibraryBuilder.build({
    cwd: '/',
    fns: [supportCode]
  });

  var formatterOptions = {
    colorsEnabled: true,
    cwd: '/',
    log: function(data) {
      data = ansi_up.ansi_to_html(data);
      $output.append(data);
      $output.scrollTop($output.prop("scrollHeight"));
    },
    supportCodeLibrary: supportCodeLibrary
  };
  var prettyFormatter = Cucumber.FormatterBuilder.build('pretty', formatterOptions);

  var runtime = new Cucumber.Runtime({
    features: [feature],
    listeners: [prettyFormatter],
    supportCodeLibrary: supportCodeLibrary
  });
  runtime.start().catch(function(error) {
    var errorContainer = $('<div>')
    errorContainer.addClass('error').text(error.stack);
    $output.append(errorContainer);
  });
};

$(function() {
  $('#run-feature').click(runFeature);

  featureEditor = ace.edit("feature");
  featureEditor.getSession().setMode("ace/mode/gherkin");

  stepDefinitionsEditor = ace.edit("step-definitions");
  stepDefinitionsEditor.getSession().setMode("ace/mode/javascript");
});
