# Attachments

Text, images and other data can be added to the output of the messages and JSON formatters with attachments.
The world constructor is passed an `attach` function,
which the default world constructor assigns to `this.attach`. If using a custom world constructor,
you need to do this as well if you want to add attachments.

```javascript
var {After} = require('@cucumber/cucumber');

After(function () {
  this.attach('Some text');
});
```

By default, text is saved with a MIME type of `text/plain`.  You can also specify
a different MIME type:

```javascript
var {After} = require('@cucumber/cucumber');

After(function () {
  this.attach('{"name": "some JSON"}', 'application/json');
});
```

Images and other binary data can be attached using a [stream.Readable](https://nodejs.org/api/stream.html).
The data will be `base64` encoded in the output.
You should wait for the stream to be read before continuing by providing a callback or waiting for the returned promise to resolve.

```javascript
var {After, Status} = require('@cucumber/cucumber');

// Passing a callback
After(function (testCase, callback) {
  if (testCase.result.status === Status.FAILED) {
    var stream = getScreenshotOfError();
    this.attach(stream, 'image/png', callback);
  }
  else {
    callback();
  }
});

// Returning the promise
After(function (testCase) {
  if (testCase.result.status === Status.FAILED) {
    var stream = getScreenshotOfError();
    return this.attach(stream, 'image/png');
  }
});
```

Images and binary data can also be attached using a [Buffer](https://nodejs.org/api/buffer.html).
The data will be `base64` encoded in the output.

```javascript
var {After, Status} = require('@cucumber/cucumber');

After(function (testCase) {
  if (testCase.result.status === Status.FAILED) {
    var buffer = getScreenshotOfError();
    this.attach(buffer, 'image/png');
  }
});
```

If you've already got a base64-encoded string, you can prefix your mime type with `base64:` to indicate this:

```javascript
var {After, Status} = require('@cucumber/cucumber');

After(function (testCase) {
  if (testCase.result.status === Status.FAILED) {
    var base64String = getScreenshotOfError();
    this.attach(base64String, 'base64:image/png');
  }
});
```

Here is an example of saving a screenshot using [Selenium WebDriver](https://www.npmjs.com/package/selenium-webdriver)
when a scenario fails:

```javascript
var {After, Status} = require('@cucumber/cucumber');

After(function (testCase) {
  var world = this;
  if (testCase.result.status === Status.FAILED) {
    return webDriver.takeScreenshot().then(function(screenShot) {
      world.attach(screenShot, 'base64:image/png');
    });
  }
});
```

Attachments are also printed by the progress, progress-bar and summary formatters.
They appear right after the step and only `text/plain` content is visible.
It can be used to debug scenarios, especially in parallel mode.

```javascript
// Step definition
Given(/^a basic step$/, function() {
  this.attach('Some info.')
  this.attach('{"some", "JSON"}}', 'application/json')
})

// Result format
// ✔ Given a basic step # path:line
//    Attachment (text/plain): Some info.
//    Attachment (application/json)
```

## Logging

You can log useful information from your support code with the simple `log` function:

```javascript
var {After} = require('@cucumber/cucumber');

After(function () {
  this.log('Something interesting happened!');
});
```

Anything you log will be attached as a string with a MIME type of `text/x.cucumber.log+plain`
