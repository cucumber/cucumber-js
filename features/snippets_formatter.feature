Feature: snippets formatter

  As a developer with undefined steps
  I want a formatter which just outputs the snippets
  So I can copy and paste all the steps I need to implement


  Scenario:
    Given a file named "features/undefined.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given undefined step A
          When undefined step B
          Then undefined step C
      """
    When I run cucumber-js with `--format snippets`
    Then it fails
    And it outputs the text:
      """
      Given('undefined step A', function (callback) {
        // Write code here that turns the phrase above into concrete actions
        callback(null, 'pending');
      });

      When('undefined step B', function (callback) {
        // Write code here that turns the phrase above into concrete actions
        callback(null, 'pending');
      });

      Then('undefined step C', function (callback) {
        // Write code here that turns the phrase above into concrete actions
        callback(null, 'pending');
      });
      """
