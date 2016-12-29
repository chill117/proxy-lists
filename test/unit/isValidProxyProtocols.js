'use strict';

var _ = require('underscore');
var expect = require('chai').expect;

var ProxyLists = require('../../index');

describe('isValidProxyProtocols(protocols)', function() {

	it('should be a function', function() {
		expect(ProxyLists.isValidProxyProtocols).to.be.a('function');
	});

	it('should return FALSE for invalid examples', function() {

		var invalidExamples = [
			[],
			['invalid'],
			['http', 'invalid'],
			'string is invalid',
			null,
			{}
		];

		_.each(invalidExamples, function(invalidExample) {
			try {
				expect(ProxyLists.isValidProxyProtocols(invalidExample)).to.equal(false);
			} catch (error) {
				throw new Error('Expected "' + JSON.stringifiy(invalidExample) + '" to be invalid.');
			}
		});
	});

	it('should return TRUE for valid examples', function() {

		var validExamples = [
			['http'],
			['https', 'socks5']
		];

		_.each(validExamples, function(validExample) {
			try {
				expect(ProxyLists.isValidProxyProtocols(validExample)).to.equal(true);
			} catch (error) {
				throw new Error('Expected "' + JSON.stringifiy(validExample) + '" to be valid.');
			}
		});
	});
});
