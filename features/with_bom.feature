Feature: User logs into the system
  In order to be able to use eraNET components
  As a user
  I want to log in to the system


  Scenario: Unlogged user sees welcome page with login
    Given I have not logged or have logged out before
    When I visit initial page
    Then Default app should be loaded
    And I should see login request
    And I should not see any username


  Scenario: Minimal user sees welcome page with its username and logout
    Given I have logged as guest named "Guest"
    When I visit initial page
    Then Default app should be loaded
    And I should see logout request
    And I should see "Guest" as username


  Scenario: Unlogged user logs in
    Given I have not logged or have logged out before
    And I have visited initial page
    And I have seen login request
    When I ask to log in
    Then I should be taken to login page


  Scenario: Logged user logs out
    Given I have logged as guest named "Guest"
    And I have visited initial page
    And I have seen logout request
    When I ask to log out
    Then I should be taken to logout page


  Scenario: Disconnected user sees welcome page and reconnect option
    Given I have had a broken connection with api site
    When I visit initial page
    Then Default app should be loaded
    And I should see reconnect request
    And I should not see any username


  Scenario: User sees 'connecting' while connecting
    Given I have had lagging api site
    When I visit initial page
    Then I should see connecting message
    And I should not see any username


