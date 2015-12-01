(function($) {



  function runFeature() {
    var supportCode;
    var output          = $('#output');
    var errors          = $('#errors');
    var errorsContainer = $('#errors-container');
    var featureSource   = $('#feature').val();
    eval('supportCode   = function() {' + $('#step-definitions').val() + '};');
    var cucumber        = Cucumber(featureSource, supportCode);
    var $output         = $('#output');
    $output.empty();
    var listener        = CucumberHTMLListener($output);
    cucumber.attachListener(listener);

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
    $('#run-feature').click(runFeature);
    $('#errors-container').hide();
  });
})(jQuery);
