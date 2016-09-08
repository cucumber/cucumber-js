# Attachments

You can attach text, images and files to the output of the JSON formatter using the scenario object:

``` javascript
this.After(function (scenario) {
  scenario.attach('Some text');
});
```

By default, text is saved with a MIME type of `text/plain`.  You can also specify
a different MIME type:

``` javascript
this.After(function (scenario) {
  scenario.attach('{"name": "some JSON"}', 'application/json');
});
```

Images and other binary data can be attached using a [stream.Readable](https://nodejs.org/api/stream.html).
In that case, passing a callback to `attach()` becomes mandatory:

``` javascript
this.After(function (scenario, callback) {
  if (scenario.isFailed()) {
    var stream = getScreenshotOfError();
    scenario.attach(stream, 'image/png', callback);
  }
  else {
    callback();
  }
});
```

Images and binary data can also be attached using a [Buffer](https://nodejs.org/api/buffer.html):

``` javascript
this.After(function (scenario) {
  if (scenario.isFailed()) {
    var buffer = getScreenshotOfError();
    scenario.attach(buffer, 'image/png');
  }
});
```

Here is an example of saving a screenshot using [Selenium WebDriver](https://www.npmjs.com/package/selenium-webdriver)
when a scenario fails:

``` javascript
this.After(function (scenario) {
  if (scenario.isFailed()) {
    return webDriver.takeScreenshot().then(function(screenShot) {
      scenario.attach(screenShot, 'image/png');
    });
  }
});
```
