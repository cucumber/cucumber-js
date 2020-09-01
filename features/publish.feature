Feature: Publish reports

  Scenario: Report is published
    Given a report server is running on 'http://localhost:9987'
    And a file named "features/a.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given a step
      """
    When I run cucumber-js with arguments `--publish` and env `CUCUMBER_PUBLISH_URL=http://localhost:9987/api/reports`
    Then it passes
    And the server should receive the following message types:
    | type |
    | meta |
    | testRunStarted |
    | testRunFinished |