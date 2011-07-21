function runFeature() {
  var Cucumber = require('./cucumber');
  var supportCode;
  var output          = $('#output');
  var errors          = $('#errors');
  var errorsContainer = $('#errors-container');
  var featureSource   = $('#feature').val();
  eval('supportCode   = function() {' + $('#step-definitions').val() + '};');
  var cucumber        = Cucumber(featureSource, supportCode);
  var listener  = Cucumber.Listener.ProgressFormatter({logToConsole: false, logToFunction: function(message) {
    output.val(output.val() + message);
  }});
  cucumber.attachListener(listener);
  output.val('');
  errors.text('');
  errorsContainer.hide();
  try {
    cucumber.start(function() {});
  } catch(err) {
    errorsContainer.show();
    var errMessage = err.message || err;
    var buffer = (errors.text() == '' ? errMessage : errors.text() + "\n\n" + errMessage);
    errors.text(buffer);
    throw err;
  };
};

$(function() {
  Gherkin = { Lexer: function() { return Lexer; } };
  $('#run-feature').click(runFeature);
  $('#errors-container').hide();
});
