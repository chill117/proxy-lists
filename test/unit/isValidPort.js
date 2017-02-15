'use strict';

var _ = require('underscore');
var expect = require('chai').expect;

var ProxyLists = require('../../index');

describe('isValidPort(port)', function() {

	it('should be a function', function() {
		expect(ProxyLists.isValidPort).to.be.a('function');
	});

	it('should return FALSE when port is not valid', function() {

		var invalidPorts = [ '', 'usda7', '443a', '80' ];

		_.each(invalidPorts, function(invalidPort) {
			try {
				expect(ProxyLists.isValidPort(invalidPort)).to.equal(false);
			} catch (error) {
				throw new Error('Expected port to be invalid: "' + invalidPort + '"');
			}
		});
	});

	it('should return TRUE when port is valid', function() {

		var validPorts = [ 80, 443, 4040, 8080, 8888 ];

		_.each(validPorts, function(validPort) {
			try {
				expect(ProxyLists.isValidPort(validPort)).to.equal(true);
			} catch (error) {
				throw new Error('Expected port to be valid: "' + validPort + '"');
			}
		});
	});
});
