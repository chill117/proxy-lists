'use strict';

var _ = require('underscore');
var expect = require('chai').expect;

var ProxyLists = require('../../index');

describe('isValidProxy(proxy)', function() {

	it('should be a function', function() {

		expect(ProxyLists.isValidProxy).to.be.a('function');
	});

	it('should return FALSE when proxy is not valid', function() {

		var invalidExamples = [
			{},
			{
				port: 4040,
				protocols: ['http']
			},
			{
				ipAddress: '12312123',
				port: 4040,
				protocols: ['http']
			},
			{
				ipAddress: '127.0.0.1',
				protocols: ['https']
			},
			{
				ipAddress: '127.0.0.1',
				port: 4040
			},
			{
				ipAddress: '127.0.0.1',
				port: 4040,
				protocols: ['invalid']
			},
			{
				ipAddress: '',
				port: 4040,
				protocols: ['socks4']
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
		var validProtocols = [ 'http', 'https', 'socks4', 'socks5' ];

		_.each(validIpAddresses, function(validIpAddress) {
			_.each(validPorts, function(validPort) {
				_.each(validProtocols, function(validProtocol) {

					var validExample = {
						ipAddress: validIpAddress,
						port: validPort,
						protocols: [validProtocol]
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
