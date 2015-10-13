'use strict';

describe('isValidProxyType(type)', function() {

	it('should be a function', function() {

		expect(ProxyLists.isValidProxyType).to.be.a('function');
	});

	it('should return FALSE when proxy type is not valid', function() {

		var invalidProxyTypes = [ 'invalid', '', 80 ];

		_.each(invalidProxyTypes, function(invalidProxyType) {

			try {

				expect(ProxyLists.isValidProxyType(invalidProxyType)).to.equal(false);

			} catch (error) {

				throw new Error('Expected proxy type to be invalid: "' + invalidProxyType + '"');
			}
		});
	});

	it('should return TRUE when proxy type is valid', function() {

		var validProxyTypes = [ 'http', 'https', 'socks4', 'socks5' ];

		_.each(validProxyTypes, function(validProxyType) {

			try {

				expect(ProxyLists.isValidProxyType(validProxyType)).to.equal(true);

			} catch (error) {

				throw new Error('Expected proxy type to be valid: "' + validProxyType + '"');
			}
		});
	});
});
