'use strict';

var _ = require('underscore');
var expect = require('chai').expect;

var ProxyLists = require('../../index');

describe('isValidIpAddress(ipAddress)', function() {

	it('should be a function', function() {
		expect(ProxyLists.isValidIpAddress).to.be.a('function');
	});

	it('should return FALSE when IP address is not valid', function() {

		var invalidIpAddresses = [
			'12312',
			'',
			'kjaskd81273',
			'127.0.256.1',
			'127.0.1',
			'-1.0.0.0'
		];

		_.each(invalidIpAddresses, function(invalidIpAddress) {
			try {
				expect(ProxyLists.isValidIpAddress(invalidIpAddress)).to.equal(false);
			} catch (error) {
				throw new Error('Expected IP address to be invalid: "' + invalidIpAddress + '"');
			}
		});
	});

	it('should return TRUE when IP address is valid', function() {

		var validIpAddresses = [
			'127.0.0.1',
			'192.168.1.1',
			'255.255.255.255',
			'1200:0000:AB00:1234:0000:2552:7777:1313',
			'21DA:D3:0:2F3B:2AA:FF:FE28:9C5A'
		];

		_.each(validIpAddresses, function(validIpAddress) {
			try {
				expect(ProxyLists.isValidIpAddress(validIpAddress)).to.equal(true);
			} catch (error) {
				throw new Error('Expected IP address to be valid: "' + validIpAddress + '"');
			}
		});
	});
});
