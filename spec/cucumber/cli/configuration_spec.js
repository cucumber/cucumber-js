require('../../support/spec_helper');
require('../../support/configurations_shared_examples.js');

describe("Cucumber.Cli.Configuration", function () {
  var Cucumber = requireLib('cucumber');
  var fs = require('fs');
  var args, configuration, options;
  var context = {};

  beforeEach(function () {
    options = {};
    args = [];
    configuration = Cucumber.Cli.Configuration(options, args);
    context.configuration = configuration;
  });

  itBehavesLikeAllCucumberConfigurations(context);

  describe("getFormatters()", function () {
    var formatter, formatterOptions;

    beforeEach(function () {
      var shouldSnippetsBeShown = createSpy("should snippets be shown?");
      var shouldShowSource = createSpy("should source uris be visible?");
      var shouldUseColors = createSpy("use colors");
      var snippetSyntax = createSpy("snippet syntax");
      formatterOptions = {
        snippets: shouldSnippetsBeShown,
        snippetSyntax: snippetSyntax,
        showSource: shouldShowSource,
        stream: process.stdout,
        useColors: shouldUseColors
      };
      options.snippets = shouldSnippetsBeShown;
      options.source = shouldShowSource;
      options.colors = shouldUseColors;
      spyOn(Cucumber.Listener, 'JsonFormatter');
      spyOn(Cucumber.Listener, 'ProgressFormatter');
      spyOn(Cucumber.Listener, 'PrettyFormatter');
      spyOn(Cucumber.Listener, 'SummaryFormatter');
      spyOn(Cucumber.SupportCode.StepDefinitionSnippetBuilder, 'JavaScriptSyntax').and.returnValue(snippetSyntax);
      formatter = createSpy("formatter");
    });

    describe("when the formatter name is \"json\"", function () {
      beforeEach(function () {
        options.format = ['json'];
        Cucumber.Listener.JsonFormatter.and.returnValue(formatter);
      });

      it("creates a new json formatter", function () {
        configuration.getFormatters();
        expect(Cucumber.Listener.JsonFormatter).toHaveBeenCalledWith(formatterOptions);
      });

      it("returns the json formatter", function () {
        expect(configuration.getFormatters()).toEqual([formatter]);
      });
    });

    describe("when the formatter name is \"progress\"", function () {
      beforeEach(function () {
        options.format = ['progress'];
        Cucumber.Listener.ProgressFormatter.and.returnValue(formatter);
      });

      it("creates a new progress formatter", function () {
        configuration.getFormatters();
        expect(Cucumber.Listener.ProgressFormatter).toHaveBeenCalledWith(formatterOptions);
      });

      it("returns the progress formatter", function () {
        expect(configuration.getFormatters()).toEqual([formatter]);
      });
    });

    describe("when the formatter name is \"pretty\"", function () {
      beforeEach(function () {
        options.format = ['pretty'];
        Cucumber.Listener.PrettyFormatter.and.returnValue(formatter);
      });

      it("creates a new pretty formatter", function () {
        configuration.getFormatters();
        expect(Cucumber.Listener.PrettyFormatter).toHaveBeenCalledWith(formatterOptions);
      });

      it("returns the pretty formatter", function () {
        expect(configuration.getFormatters()).toEqual([formatter]);
      });
    });

    describe("when the formatter name is \"summary\"", function () {
      beforeEach(function () {
        options.format = ['summary'];
        Cucumber.Listener.SummaryFormatter.and.returnValue(formatter);
      });

      it("creates a new summary formatter", function () {
        configuration.getFormatters();
        expect(Cucumber.Listener.SummaryFormatter).toHaveBeenCalledWith(formatterOptions);
      });

      it("returns the summary formatter", function () {
        expect(configuration.getFormatters()).toEqual([formatter]);
      });
    });

    describe("when the formatter output is redirected", function () {
      var fd;

      beforeEach(function () {
        fd = createSpy('fd');
        spyOn(fs, 'openSync').and.returnValue(fd);

        var stream = createSpy('stream');
        formatterOptions.stream = stream;
        spyOn(fs, 'createWriteStream').and.returnValue(stream);

        options.format = ['json:path/to/file'];
        Cucumber.Listener.JsonFormatter.and.returnValue(formatter);
      });

      it("opens the file for writing", function () {
        configuration.getFormatters();
        expect(fs.openSync).toHaveBeenCalledWith('path/to/file', 'w');
      });

      it("creates a write stream to the file", function () {
        configuration.getFormatters();
        expect(fs.createWriteStream).toHaveBeenCalledWith(null, {fd: fd});
      });

      it("creates a new json formatter", function () {
        configuration.getFormatters();
        expect(Cucumber.Listener.JsonFormatter).toHaveBeenCalledWith(formatterOptions);
      });

      it("returns the json formatter", function () {
        expect(configuration.getFormatters()).toEqual([formatter]);
      });
    });

    describe("when the formatter name is unknown", function () {
      beforeEach(function () {
        options.format = ['blah'];
      });

      it("throws an exceptions", function () {
        expect(configuration.getFormatters).toThrow();
      });
    });
  });
});
