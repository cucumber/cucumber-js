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
a different MIME type as part of a second argument:

```javascript
var {After} = require('@cucumber/cucumber');

After(function () {
  this.attach('{"name": "some JSON"}', { mediaType: 'application/json' });
});
```

If you'd like, you can also specify a filename to be used if the attachment is made available to download as a file via a formatter:

```javascript
var {After} = require('@cucumber/cucumber');

After(function () {
  this.attach('{"name": "some JSON"}', {
    mediaType: 'application/json',
    fileName: 'results.json'
  });
});
```

Images and other binary data can be attached using a [stream.Readable](https://nodejs.org/api/stream.html).
The data will be `base64` encoded in the output.
You should wait for the stream to be read before continuing by awaiting the returned promise or providing a callback.

```javascript
var {After, Status} = require('@cucumber/cucumber');

// Awaiting the promise
After(async function (testCase) {
  if (testCase.result.status === Status.FAILED) {
    var stream = getScreenshotOfError();
    await this.attach(stream, { mediaType: 'image/png' });
  }
});

// Passing a callback
After(function (testCase, callback) {
  if (testCase.result.status === Status.FAILED) {
    var stream = getScreenshotOfError();
    this.attach(stream, { mediaType: 'image/png' }, callback);
  }
  else {
    callback();
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
    this.attach(buffer, { mediaType: 'image/png' });
  }
});
```

If you've already got a base64-encoded string, you can prefix your mime type with `base64:` to indicate this. Here's an example of saving a screenshot using [Selenium WebDriver](https://www.npmjs.com/package/selenium-webdriver)
when a scenario fails:

```javascript
var {After, Status} = require('@cucumber/cucumber');

After(async function (testCase) {
  if (testCase.result.status === Status.FAILED) {
    const screenshot = await driver.takeScreenshot()
    this.attach(screenshot, { mediaType: 'base64:image/png' })
  }
})
```

Attachments are also printed by the progress, progress-bar and summary formatters.
They appear right after the step and only `text/plain` content is visible.
It can be used to debug scenarios, especially in parallel mode.

```javascript
// Step definition
Given('a basic step', async function() {
  this.attach('Some info.')
  this.attach('{"some": "JSON"}}', { mediaType: 'application/json' })
  this.attach((await driver.takeScreenshot()), {
    mediaType: 'base64:image/png',
    fileName: 'screenshot.png'
  })
})

// Result format
// ✔ Given a basic step # path:line
//    Attachment (text/plain): Some info.
//    Attachment (application/json)
//    Attachment (image/png): screenshot.png
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
