# Attachments

You can attach text, images and files to the output of the JSON formatter:

``` javascript
this.After(function () {
  this.attach('Some text');
});
```

By default, text is saved with a MIME type of `text/plain`.  You can also specify
a different MIME type:

``` javascript
this.After(function () {
  this.attach('{"name": "some JSON"}', 'application/json');
});
```

Images and other binary data can be attached using a [stream.Readable](https://nodejs.org/api/stream.html).
The data will be `base64` encoded in the output.
You should wait for the stream to be read before continuing by providing a callback or waiting for the returned promise to resolve.

``` javascript
// Passing a callback
this.After(function (scenarioResult, callback) {
  if (scenarioResult.isFailed()) {
    var stream = getScreenshotOfError();
    this.attach(stream, 'image/png', callback);
  }
  else {
    callback();
  }
});

// Returning the promise
this.After(function (scenarioResult) {
  if (scenarioResult.isFailed()) {
    var stream = getScreenshotOfError();
    return this.attach(stream, 'image/png');
  }
});
```

Images and binary data can also be attached using a [Buffer](https://nodejs.org/api/buffer.html).
The data will be `base64` encoded in the output.

``` javascript
this.After(function (scenarioResult) {
  if (scenarioResult.isFailed()) {
    var buffer = getScreenshotOfError();
    this.attach(buffer, 'image/png');
  }
});
```

Here is an example of saving a screenshot using [Selenium WebDriver](https://www.npmjs.com/package/selenium-webdriver)
when a scenario fails:

``` javascript
this.After(function (scenarioResult) {
  var world = this;
  if (scenarioResult.isFailed()) {
    return webDriver.takeScreenshot().then(function(screenShot) {
      // screenShot is a base-64 encoded PNG
      world.attach(screenShot, 'image/png');
    });
  }
});
```
