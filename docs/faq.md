# Frequently Asked Questions

#### The world instance isn't available in my hooks or step definitions.

This has frequently been caused by the use of ES6 arrow functions.
You cannot use ES6 arrow functions for step definitions or hooks because they bind `this`
to the current context which prevents the world instance from being injected.

#### Why do my definition patterns need to be globally unique instead of unique only within `Given`, `When`, `Then`?

To encourage a ubiquitous, non-ambiguous domain language. 
Using the same language to mean different things is basically the definition of ambiguous.
If you have similar `Given` and `Then` patterns, try adding the work "should" to your `Then` pattern
