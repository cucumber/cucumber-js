## Strings patterns

It is also possible to use simple strings instead of regexps as step definition patterns:

```javascript
this.Then('I should see "$title" as the page title', function (title) {
  // the above string is converted to the following regexp:
  // /^I should see "([^"]*)" as the page title$/
});

this.Then('I have $count cucumbers', function (title) {
  // the above string is converted to the following regexp:
  // /^I have (.*) cucumbers$/
});
```
