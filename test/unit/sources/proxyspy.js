'use strict';

var _ = require('underscore');
var async = require('async');
var expect = require('chai').expect;

var ProxyLists = require('../../../index');

describe('source.proxyspy', function() {

	var proxyspy = require('../../../sources/proxyspy');

	describe('parseResponseData({ data }, cb)', function() {

		it('should be a function', function() {

			expect(proxyspy.parseResponseData).to.be.a('function');
		});

		it('should parse the response data into an array of proxies', function(done) {

			var samples = require('../../samples/proxyspy/data');

			async.each(samples, function(sample, next) {
				proxyspy.parseResponseData({ data: sample.txt }, function(error, proxies) {

					try {

						expect(error).to.equal(null);
						expect(proxies).to.be.an('array');
						expect(proxies).to.have.length(9);

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
