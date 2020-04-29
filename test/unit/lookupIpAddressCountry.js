'use strict';

var _ = require('underscore');
var expect = require('chai').expect;

var ProxyLists = require('../../index');

describe('lookupIpAddressCountry(proxy)', function() {

	it('should be a function', function() {
		expect(ProxyLists.lookupIpAddressCountry).to.be.a('function');
	});

	describe('throws error for invalid argument ("proxy")', function() {
		_.each([
			null,
			1,
			[],
		], function(proxy) {
			it(JSON.stringify(proxy), function() {
				var thrownError;
				try {
					ProxyLists.lookupIpAddressCountry(proxy);
				} catch (error) {
					thrownError = error.message;
				}
				expect(thrownError).to.equal('Invalid argument ("proxy"): String expected');
			})
		});
	});

	describe('returns correct country for sample proxies', function() {

		_.each([
			{ ipAddress: '118.69.50.154', country: 'vn' },
			{ ipAddress: '80.187.140.26', country: 'de' },
			{ ipAddress: '128.199.98.41', country: 'sg' },
		], function(test) {
			it(JSON.stringify(test), function() {
				var result = ProxyLists.lookupIpAddressCountry(test.ipAddress);
				expect(result).to.equal(test.country);
			});
		});
	});
});
