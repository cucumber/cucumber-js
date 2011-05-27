Feature: Basic feature execution
  In order to do BDD with Javascript
  As a cucumber afficionado
  I want to run cucumber fatures in whatever Javascript environment I use

  Scenario: Simple flat steps
    Given the following support code:
    """
    var variable;
  
    Given(/a variable set to (\d+)/, function(number, callback) {
      variable = parseInt(number);
      callback();
    });

    When(/I increment the variable by (\d+)/, function(number, callback) {
      variable += parseInt(number);
      callback();
    });
    
    Then(/the variable should contain (\d+)/, function(number, callback) {
      if (variable != parseInt(number))
        throw('Variable should contain '+number+' but it contains '+variable+'.');
      callback();
    });
    """
    When I run the following cucumber feature with a listener:
    """
    Feature: Simple maths
      In order to do maths
      As a developer
      I want to increment variables

      Scenario: Increment variable once
        Given a variable set to 1
        When I increment the variable by 1
        Then the variable should contain 2
    """
    Then the listener should have printed the following:
    """
    Feature: Simple maths
      In order to do maths
      As a developer
      I want to increment variables

      Scenario: Increment variable once
        Given a variable set to 1
        When I increment the variable by 1
        Then the variable should contain 2
    """

  Scenario: Steps with PY strings
    Given the following support code:
    """
    var poem;

    When(/I write the following poem:/, function(poemText, callback) {
      poem = poemText;
      callback();
    });

    Then(/my poem should be published/, function(callback) {
      if (!poem)
        throw('Poem was expected to be published.');
      callback();
    });
    """
    When I run the following cucumber feature with a listener:
    """
    Feature: Write a poem
      In order to write great poems
      As a writer
      I want to use PY strings

      Scenario: Publish poem
        When I write the following poem:
        \"\"\"
        Through tests
        the behaviour of all is bent
        for the whole to emerge.
        \"\"\"
        Then my poem should be published
    """
    Then the listener should have printed the following:
    """
    Feature: Write a poem
      In order to write great poems
      As a writer
      I want to use PY strings

      Scenario: Publish poem
        When I write the following poem:
        \"\"\"
        Through tests
        the behaviour of all is bent
        for the whole to emerge.
        \"\"\"
        Then my poem should be published
    """
