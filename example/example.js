function runFeature() {
  var supportCode;
  var output          = $('#output');
  var errors          = $('#errors');
  var errorsContainer = $('#errors-container');
  var featureSource   = $('#feature').val();
  eval('supportCode = function() {' + $('#step-definitions').val() + '};');
  var cucumber        = Cucumber(featureSource, supportCode);
  var simpleListener  = Cucumber.Debug.SimpleAstListener({logToFunction: function(message) {
    output.val(output.val() + message + "\n");
  }});
  cucumber.attachListener(simpleListener);
  output.val('');
  errors.text('');
  errorsContainer.hide();
  try {
    cucumber.start(function() {
      /*
        Some "after" messages from the tree walker are still not processed when
        the callback is triggered. It means that post-processing might still
        be on hold on listeners. This is due to
        Cucumber.TreeWalker.broadcastMessagesBeforeAndAfterFunction() using no
        callback and expecting the passed function to handle the possible
        callback.
        
        Fixing this is easy: broadcastMessagesBeforeAndAfterFunction() would
        need a callback and run it AFTER broadcasting "after" messages.
        
        Uncomment the following line to see that behaviour:
      */
      //console.log("Done. But too soon, some dudes haven't finished doing their stuff just yet.");
    });
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
