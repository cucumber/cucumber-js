# Attachments

Text, images and files can be added to the output of the JSON formatter with attachments.
The world constructor is passed an `attach` function,
which the default world constructor assigns to `this.attach`. If using a custom world constructor,
you need to do this as well if you want to add attachments.

```javascript
var {defineSupportCode} = require('cucumber');

defineSupportCode(function({After}) {
  After(function () {
    this.attach('Some text');
  });
});
```

By default, text is saved with a MIME type of `text/plain`.  You can also specify
a different MIME type:

```javascript
var {defineSupportCode} = require('cucumber');

defineSupportCode(function({After}) {
  After(function () {
    this.attach('{"name": "some JSON"}', 'application/json');
  });
});
```

Images and other binary data can be attached using a [stream.Readable](https://nodejs.org/api/stream.html).
The data will be `base64` encoded in the output.
You should wait for the stream to be read before continuing by providing a callback or waiting for the returned promise to resolve.

```javascript
var {defineSupportCode, Status} = require('cucumber');

defineSupportCode(function({After}) {
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
});
```

Images and binary data can also be attached using a [Buffer](https://nodejs.org/api/buffer.html).
The data will be `base64` encoded in the output.

```javascript
var {defineSupportCode} = require('cucumber');

defineSupportCode(function({After}) {
  After(function (testCase) {
    if (testCase.result.status === Status.FAILED) {
      var buffer = getScreenshotOfError();
      this.attach(buffer, 'image/png');
    }
  });
});
```

Here is an example of saving a screenshot using [Selenium WebDriver](https://www.npmjs.com/package/selenium-webdriver)
when a scenario fails:

```javascript
var {defineSupportCode} = require('cucumber');

defineSupportCode(function({After}) {
    After(function (testCase) {
    var world = this;
    if (testCase.result.status === Status.FAILED) {
      return webDriver.takeScreenshot().then(function(screenShot) {
        // screenShot is a base-64 encoded PNG
        world.attach(screenShot, 'image/png');
      });
    }
  });
});
```
