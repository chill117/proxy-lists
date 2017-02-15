'use strict';

var _ = require('underscore');
var expect = require('chai').expect;

var ProxyLists = require('../../index');

describe('isValidAnonymityLevel(anonymityLevel)', function() {

	it('should be a function', function() {
		expect(ProxyLists.isValidAnonymityLevel).to.be.a('function');
	});

	it('should return FALSE when IP address is not valid', function() {

		var invalidAnonymityLevels = [
			'l',
			'',
			null,
			undefined,
			100
		];

		_.each(invalidAnonymityLevels, function(invalidAnonymityLevel) {
			try {
				expect(ProxyLists.isValidAnonymityLevel(invalidAnonymityLevel)).to.equal(false);
			} catch (error) {
				throw new Error('Expected anonymity level to be invalid: "' + invalidAnonymityLevel + '"');
			}
		});
	});

	it('should return TRUE when anonymity level is valid', function() {

		var validAnonymityLevels = [
			'transparent',
			'anonymous',
			'elite'
		];

		_.each(validAnonymityLevels, function(validAnonymityLevel) {
			try {
				expect(ProxyLists.isValidAnonymityLevel(validAnonymityLevel)).to.equal(true);
			} catch (error) {
				throw new Error('Expected anonymity level to be valid: "' + validAnonymityLevel + '"');
			}
		});
	});
});
