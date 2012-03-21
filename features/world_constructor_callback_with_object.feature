Feature: World constructor callback with object
  It is possible for the World constructor function to tell Cucumber
  to use another object than itself as the World instance:

    this.World = function WorldConstructor(callback) {
      var myCustomWorld = { dance: function() { /* ... */ } };
      callback(myCustomWorld); // tell Cucumber to use myCustomWorld
                               // as the world object.
    };

  If no parameter is passed to the callback, the WorldConstructor
  instance will be used by Cucumber:

    this.World = function WorldConstructor(callback) {
      var myCustomWorld = {};
      callback(); // could have been written `callback(this);`
    };

  Scenario: scenario calling function on explicit world instance
    Given a custom World constructor calling back with an explicit object
    When Cucumber executes a scenario that calls a function on the explicit World object
    Then the feature passes
    And the explicit World object function should have been called
