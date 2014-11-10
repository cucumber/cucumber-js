// vim: noai:ts=2:sw=2
var StepDefinition = function (pattern, code, uri, codeType) {
    var Cucumber = require('../../cucumber');
    var stackSettings = require('../stackSettings');

    var self = {
        getUri: function getUri() {
            return uri;
        },

        getPatternRegexp: function getPatternRegexp() {
            var regexp;
            if (pattern.replace) {
                var regexpString = pattern
                    .replace(StepDefinition.UNSAFE_STRING_CHARACTERS_REGEXP, StepDefinition.PREVIOUS_REGEXP_MATCH)
                    .replace(StepDefinition.QUOTED_DOLLAR_PARAMETER_REGEXP, StepDefinition.QUOTED_DOLLAR_PARAMETER_SUBSTITUTION)
                    .replace(StepDefinition.DOLLAR_PARAMETER_REGEXP, StepDefinition.DOLLAR_PARAMETER_SUBSTITUTION);
                regexpString =
                    StepDefinition.STRING_PATTERN_REGEXP_PREFIX +
                    regexpString +
                    StepDefinition.STRING_PATTERN_REGEXP_SUFFIX;
                regexp = RegExp(regexpString);
            }
            else
                regexp = pattern;
            return regexp;
        },

        matchesStepName: function matchesStepName(stepName, tagNames) {
            var regexp = self.getPatternRegexp();
            var found = regexp.test(stepName);

            // If we're a primary step def (i.e. loaded from 'support' folder) then ignore tags
            //   and match as normal. Otherwise, if any tags start `@:` or `@./` then do uri matching
            //   before reporting a match.

            if (found && codeType != "primary") {
                var sourcesSpecified = false;
                var tagMatchesUri = false;
                var fullPath = uri.replace(/\\/g, '/');
                var endSlash = fullPath.lastIndexOf('/');
                var fileNameNoPathOrExtension = fullPath.slice(endSlash + 1, -3);
                var pathWithNoFilename = fullPath.slice(0, endSlash);

                (tagNames || []).some(function(tag) {
                    var byName = tag.indexOf('@:') === 0;
                    var byPathEnd = tag.indexOf('@./') === 0;
                    if ( ! byName &&  ! byPathEnd) return false;

                    sourcesSpecified = true;
                    if (byName) {
                        var targetName = tag.substr(2);
                        if (targetName === fileNameNoPathOrExtension) {
                            tagMatchesUri = true;
                            return true;
                        }
                    }
                    if (byPathEnd) {
                        var targetPath = tag.substr(3);
                        var matchPath = pathWithNoFilename.slice(-(targetPath.length));
                        if (targetPath === matchPath) {
                            tagMatchesUri = true;
                            return true;
                        }
                    }
                });

                if (sourcesSpecified && ! tagMatchesUri) {
                    found = false;
                }
            }
            return found;
        },

        invoke: function invoke(step, world, scenario, callback) {
            var time = function time() {
                if (typeof process !== 'undefined' && process.hrtime) {
                    return process.hrtime();
                }
                else {
                    return new Date().getTime();
                }
            };

            var durationInNanoseconds = function durationInNanoseconds(start) {
                if (typeof process !== 'undefined' && process.hrtime) {
                    var duration = process.hrtime(start);
                    return duration[0] * 1e9 + duration[1];
                }
                else {
                    return (new Date().getTime() - start) * 1e6;
                }
            };

            var start = time();

            var cleanUp = function cleanUp() {
                Cucumber.Util.Exception.unregisterUncaughtExceptionHandler(handleException);
            };

            var codeCallback = self.buildCodeCallback(function (error) {
                if (error) {
                    codeCallback.fail(error);
                } else {
                    var duration = durationInNanoseconds(start);
                    var successfulStepResult = Cucumber.Runtime.SuccessfulStepResult({step: step, duration: duration, attachments: scenario.getAttachments()});
                    cleanUp();
                    callback(successfulStepResult);
                }
            });

            codeCallback.pending = function pending(reason) {
                var pendingStepResult = Cucumber.Runtime.PendingStepResult({step: step, pendingReason: reason, attachments: scenario.getAttachments()});
                cleanUp();
                callback(pendingStepResult);
            };

            codeCallback.fail = function fail(failureReason) {
                if (failureReason && stackSettings.useShortTraces && failureReason.stack) {
                    var stackPieces = failureReason.stack.split("\n");

                    if(stackPieces && stackPieces.length > 1)
                        failureReason = stackPieces[0] + "\n" + stackPieces[1];
                }

                var failureException = failureReason || new Error(StepDefinition.UNKNOWN_STEP_FAILURE_MESSAGE);
                var duration = durationInNanoseconds(start);
                var failedStepResult = Cucumber.Runtime.FailedStepResult({step: step, failureException: failureException, duration: duration, attachments: scenario.getAttachments()});
                cleanUp();
                callback(failedStepResult);
            };

            var parameters = self.buildInvocationParameters(step, scenario, codeCallback);
            var handleException = self.buildExceptionHandlerToCodeCallback(codeCallback);
            Cucumber.Util.Exception.registerUncaughtExceptionHandler(handleException);

            try {
                code.apply(world, parameters);
            } catch (exception) {
                handleException(exception);
            }
        },

        buildCodeCallback: function buildCodeCallback(callback) {
            return callback;
        },

        buildInvocationParameters: function buildInvocationParameters(step, scenario, callback) {
            var stepName = step.getName();
            var patternRegexp = self.getPatternRegexp();
            var parameters = patternRegexp.exec(stepName);
            parameters.shift();
            if (step.hasAttachment()) {
                var attachmentContents = step.getAttachmentContents();
                parameters.push(attachmentContents);
            }
            parameters.push(callback);
            return parameters;
        },

        buildExceptionHandlerToCodeCallback: function buildExceptionHandlerToCodeCallback(codeCallback) {
            var exceptionHandler = function handleScenarioException(exception) {
                if (exception)
                    Cucumber.Debug.warn(exception.stack || exception, 'exception inside feature', 3);
                codeCallback.fail(exception);
            };
            return exceptionHandler;
        }
    };
    return self;
};

StepDefinition.DOLLAR_PARAMETER_REGEXP              = /\$[a-zA-Z_-]+/g;
StepDefinition.DOLLAR_PARAMETER_SUBSTITUTION        = '(.*)';
StepDefinition.PREVIOUS_REGEXP_MATCH                = "\\$&";
StepDefinition.QUOTED_DOLLAR_PARAMETER_REGEXP       = /"\$[a-zA-Z_-]+"/g;
StepDefinition.QUOTED_DOLLAR_PARAMETER_SUBSTITUTION = '"([^"]*)"';
StepDefinition.STRING_PATTERN_REGEXP_PREFIX         = '^';
StepDefinition.STRING_PATTERN_REGEXP_SUFFIX         = '$';
StepDefinition.UNSAFE_STRING_CHARACTERS_REGEXP      = /[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\|]/g;
StepDefinition.UNKNOWN_STEP_FAILURE_MESSAGE         = "Step failure";

module.exports = StepDefinition;
