'use strict';

var _ = require('underscore');
var expect = require('chai').expect;

var ProxyLists = require('../../index');

describe('isValidProxyProtocol(protocol)', function() {

	it('should be a function', function() {
		expect(ProxyLists.isValidProxyProtocol).to.be.a('function');
	});

	it('should return FALSE when proxy protocol is not valid', function() {

		var invalidProxyProtocols = [ 'invalid', '', 80 ];

		_.each(invalidProxyProtocols, function(invalidProxyProtocol) {
			try {
				expect(ProxyLists.isValidProxyProtocol(invalidProxyProtocol)).to.equal(false);
			} catch (error) {
				throw new Error('Expected proxy protocol to be invalid: "' + invalidProxyProtocol + '"');
			}
		});
	});

	it('should return TRUE when proxy protocol is valid', function() {

		var validProxyProtocols = [ 'http', 'https', 'socks4', 'socks5' ];

		_.each(validProxyProtocols, function(validProxyProtocol) {
			try {
				expect(ProxyLists.isValidProxyProtocol(validProxyProtocol)).to.equal(true);
			} catch (error) {
				throw new Error('Expected proxy protocol to be valid: "' + validProxyProtocol + '"');
			}
		});
	});
});
