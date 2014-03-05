require('./support/spec_helper');

describe('Cucumber', function () {
    'use strict';
    var cucumber = requireLib('cucumber');

    var featureSource, supportCodeInitializer, options, configuration, runtime;

    beforeEach(function () {
        featureSource = createSpy('feature source');
        supportCodeInitializer = createSpy('support code initialize');
        options = createSpy('other options');
        configuration = createSpy('volatile configuration');
        runtime = createSpy('Cucumber runtime');
        spyOn(cucumber, 'VolatileConfiguration').andReturn(configuration);
        spyOn(cucumber, 'Runtime').andReturn(runtime);
    });

    it('creates a volatile configuration with the feature source and support code definition', function () {
        cucumber(featureSource, supportCodeInitializer, options);
        expect(cucumber.VolatileConfiguration).toHaveBeenCalledWith(featureSource, supportCodeInitializer, options);
    });

    it('creates a Cucumber runtime with the configuration', function () {
        cucumber(featureSource, supportCodeInitializer, options);
        expect(cucumber.Runtime).toHaveBeenCalledWith(configuration);
    });

    it('returns the Cucumber runtime', function () {
        expect(cucumber(featureSource, supportCodeInitializer, options)).toBe(runtime);
    });
});