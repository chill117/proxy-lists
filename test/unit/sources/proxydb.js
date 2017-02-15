'use strict';

var _ = require('underscore');
var async = require('async');
var expect = require('chai').expect;

describe('source.proxydb', function() {

	var Source = require('../../../sources/proxydb');

	describe('parsePageHtml(html, cb)', function() {

		it('should be a function', function() {

			expect(Source.parsePageHtml).to.be.a('function');
		});

		it('should parse the HTML into an array of proxies', function(done) {

			var samples = require('../../samples/proxydb/pageHtml');

			async.each(samples, function(pageHtml, next) {

				Source.parsePageHtml(pageHtml, function(error, proxies) {

					try {

						expect(error).to.equal(null);
						expect(proxies).to.be.an('array');
						expect(proxies.length > 0).to.equal(true);

						_.each(proxies, function(proxy) {
							expect(proxy.ipAddress).to.not.equal(undefined);
							expect(proxy.ipAddress).to.be.a('string');
							expect(proxy.port).to.not.equal(undefined);
							expect(proxy.port).to.be.a('number');
							expect(proxy.port).to.equal(parseInt(proxy.port));
							expect(proxy.protocols).to.be.an('array');
						});

					} catch (error) {
						return next(error);
					}

					next();
				});

			}, done);
		});
	});
});
