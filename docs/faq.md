# Frequently Asked Questions

#### The world instance isn't available in my hooks or step definitions.

This has frequently been caused by the use of ES6 arrow functions.
You cannot use ES6 arrow functions for step definitions or hooks because they bind `this`
to the current context which prevents the world instance from being injected.
