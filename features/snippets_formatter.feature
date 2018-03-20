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
      Given('undefined step A', function () {
        // Write code here that turns the phrase above into concrete actions
        return 'pending';
      });

      When('undefined step B', function () {
        // Write code here that turns the phrase above into concrete actions
        return 'pending';
      });

      Then('undefined step C', function () {
        // Write code here that turns the phrase above into concrete actions
        return 'pending';
      });
      """
