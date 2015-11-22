'use strict';

var _ = require('underscore');
var async = require('async');
var expect = require('chai').expect;

var ProxyLists = require('../../../index');

describe('source.freeproxylist', function() {

	var freeproxylist = require('../../../sources/freeproxylist');

	describe('parseListHtml(listHtml, cb)', function() {

		it('should be a function', function() {

			expect(freeproxylist.parseListHtml).to.be.a('function');
		});

		it('should parse the list data into an array of proxies', function(done) {

			var samples = require('../../samples/freeproxylist/listHtml');

			async.each(samples, function(listHtml, next) {

				freeproxylist.parseListHtml(listHtml, function(error, proxies) {

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
						return next(error);
					}

					next();
				});

			}, done);
		});
	});

	describe('prepareListUrls(options)', function() {

		it('should be a function', function() {

			expect(freeproxylist.prepareListUrls).to.be.a('function');
		});

		it('should return an array of list URLs', function() {

			var options = {
				protocols: ['http', 'https'],
				anonymityLevels: ['transparent']
			};

			var listUrls = freeproxylist.prepareListUrls(options);

			expect(listUrls).to.be.an('array');
			expect(listUrls.length > 0).to.equal(true);

			_.each(listUrls, function(listUrl) {
				expect(listUrl).to.be.a('string');
				expect(listUrl.length > 0).to.equal(true);
				expect(listUrl.substr(0, 'http'.length)).to.equal('http');
			});
		});
	});
});
