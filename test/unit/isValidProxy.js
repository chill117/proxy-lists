'use strict';

describe('isValidProxy(proxy)', function() {

	it('should be a function', function() {

		expect(ProxyLists.isValidProxy).to.be.a('function');
	});

	it('should return FALSE when proxy is not valid', function() {

		var invalidExamples = [
			{},
			{
				port: 4040,
				type: 'http'
			},
			{
				ip_address: '12312123',
				port: 4040,
				type: 'http'
			},
			{
				ip_address: '127.0.0.1',
				type: 'https'
			},
			{
				ip_address: '127.0.0.1',
				port: 4040
			},
			{
				ip_address: '127.0.0.1',
				port: 4040,
				type: 'invalid'
			},
			{
				ip_address: '',
				port: 4040,
				type: 'socks4'
			},
			{
				ip_address: '127.0.0.1',
				port: 80,
				type: 'http',
				country: null
			},
			{
				ip_address: '127.0.0.1',
				port: 80,
				type: 'http',
				country: 'invalid country'
			}
		];

		_.each(invalidExamples, function(invalidExample) {

			try {

				expect(ProxyLists.isValidProxy(invalidExample)).to.equal(false);

			} catch (error) {

				throw new Error('Expected proxy to be invalid: "' + JSON.stringify(invalidExample) + '"');
			}
		});
	});

	it('should return TRUE when proxy is valid', function() {

		var validIpAddresses = [
			'127.0.0.1',
			'192.168.1.1',
			'255.255.255.255'
		];
		var validPorts = [ 80, 8080, 443 ];
		var validTypes = [ 'http', 'https', 'socks4', 'socks5' ];
		var validCountries = [ 'ca', 'us' ];

		_.each(validIpAddresses, function(validIpAddress) {
			_.each(validPorts, function(validPort) {
				_.each(validTypes, function(validType) {
					_.each(validCountries, function(validCountry) {

						var validExample = {
							ip_address: validIpAddress,
							port: validPort,
							type: validType,
							country: validCountry
						};

						try {

							expect(ProxyLists.isValidProxy(validExample)).to.equal(true);

						} catch (error) {

							throw new Error('Expected proxy to be valid: "' + JSON.stringify(validExample) + '"');
						}
					});
				});
			});
		});
	});
});
