var featureEditor, stepDefinitionsEditor;

function runFeature() {
  var $output = $('#output');
  $output.empty();

  var featureSource = featureEditor.getValue();
  var supportCode;
  eval('supportCode = function() {' + stepDefinitionsEditor.getValue() + '};');
  var cucumber = Cucumber(featureSource, supportCode);

  var prettyFormatterOptions = {
    logToFunction: function(data) {
      data = ansi_up.ansi_to_html(data);
      $output.append(data);
      $output.scrollTop($output.prop("scrollHeight"));
    },
    useColors: true
  };
  var listener = Cucumber.Listener.PrettyFormatter(prettyFormatterOptions);
  cucumber.attachListener(listener);

  $('a[href="#output-tab"]').tab('show');

  try {
    cucumber.start(function() {});
  } catch(err) {
    var errorContainer = $('<div>')
    errorContainer.addClass('error').text(err.stack);
    $output.append(errorContainer);
  };
};

$(function() {
  $('#run-feature').click(runFeature);

  featureEditor = ace.edit("feature");
  featureEditor.getSession().setMode("ace/mode/gherkin");

  stepDefinitionsEditor = ace.edit("step-definitions");
  stepDefinitionsEditor.getSession().setMode("ace/mode/javascript");
});
