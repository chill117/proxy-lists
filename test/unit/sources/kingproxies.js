'use strict';

var _ = require('underscore');
var expect = require('chai').expect;

var ProxyLists = require('../../../index');

describe('source.kingproxies', function() {

	var kingproxies = require('../../../sources/kingproxies');

	describe('parseResponseData(data, cb)', function() {

		it('should be a function', function() {

			expect(kingproxies.parseResponseData).to.be.a('function');
		});

		it('should parse the list data into an array of proxies', function(done) {

			var data = '{"data":{"total_num_proxies_matching_conditions":5245,"proxies":[{"ip":"127.0.0.1","port":8888,"region":null,"city":null,"country_code":"CZ","type":"transparent","protocols":["http"],"alive":true,"reliability":99},{"ip":"255.255.255.255","port":3128,"region":"OR","city":"Boardman","country_code":"US","type":"transparent","protocols":["http"],"alive":true,"reliability":99},{"ip":"192.168.0.1","port":80,"region":null,"city":null,"country_code":"MX","type":"anonymous","protocols":["http"],"alive":true,"reliability":99},{"ip":"192.168.0.125","port":3128,"region":null,"city":"Medell\u00edn","country_code":"CO","type":"transparent","protocols":["http"],"alive":true,"reliability":99}]}}';

			kingproxies.parseResponseData(data, function(error, proxies) {

				try {

					expect(error).to.equal(null);
					expect(proxies).to.be.an('array');
					expect(proxies.length > 0).to.equal(true);

					var invalidProxies = [];

					_.each(proxies, function(proxy) {

						try {

							expect(ProxyLists.isValidProxy(proxy)).to.equal(true);

						} catch (error) {

							invalidProxies.push(proxy);
						}
					});

					expect(invalidProxies).to.deep.equal([]);

				} catch (error) {
					return done(error);
				}

				done();
			});
		});
	});
});
