require('../../support/spec_helper');

describe('Cucumber.SupportCode.WorldConstructor', function () {
    'use strict';
    var Cucumber = requireLib('cucumber');

    it('returns a default World constructor', function () {
        expect(Cucumber.SupportCode.WorldConstructor()).toBeAFunction();
    });

    describe('default World constructor', function () {
        var callback;

        beforeEach(function () {
            callback = createSpy('callback');
        });

        it('calls back', function () {
            new Cucumber.SupportCode.WorldConstructor()(callback);
            expect(callback).toHaveBeenCalled();
        });
    });
});