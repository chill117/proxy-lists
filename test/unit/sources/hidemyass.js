'use strict';

var _ = require('underscore');
var async = require('async');
var expect = require('chai').expect;

var ProxyLists = require('../../../index');

describe('source.hidemyass', function() {

	var hidemyass = require('../../../sources/hidemyass');

	describe('parseResponseData(data, cb)', function() {

		it('should be a function', function() {

			expect(hidemyass.parseResponseData).to.be.a('function');
		});

		it('should parse the response data into an array of proxies', function(done) {

			var samples = require('../../samples/hidemyass/data');

			async.each(samples, function(data, next) {

				hidemyass.parseResponseData(data, function(error, proxies) {

					try {

						expect(error).to.equal(null);
						expect(proxies).to.be.an('array');
						expect(proxies).to.have.length(10);

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
						return next(error);
					}

					next();
				});

			}, done);
		});
	});
});
