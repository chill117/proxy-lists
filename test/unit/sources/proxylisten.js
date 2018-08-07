'use strict';

var _ = require('underscore');
var async = require('async');
var expect = require('chai').expect;

var ProxyLists = require('../../../index');

describe('source.proxylisten', function() {

	var proxylisten = require('../../../sources/proxylisten');

	describe('parseInfoPageHtml(infoPageHtml, cb)', function() {

		it('should be a function', function() {

			expect(proxylisten.parseInfoPageHtml).to.be.a('function');
		});

		it('should parse the list data into an array of proxies', function(done) {

			var samples = require('../../samples/proxylisten/infoPage');

			async.each(samples, function(infoPageHtml, next) {

				proxylisten.parseInfoPageHtml(infoPageHtml, function(error, info) {

					try {

						expect(error).to.equal(null);
						expect(info).to.be.an('object');
						expect(info.hiddenField).to.be.an('object');
						expect(info.hiddenField.name).to.not.be.undefined;
						expect(info.hiddenField.value).to.not.be.undefined;
						expect(info.stats).to.be.an('object');

						_.each(info.stats, function(stat) {
							expect(parseInt(stat).toString()).to.equal(stat.toString());
						});

					} catch (error) {
						return next(error);
					}

					next();
				});

			}, done);
		});
	});

	describe('parseListHtml(listHtml, cb)', function() {

		it('should be a function', function() {

			expect(proxylisten.parseListHtml).to.be.a('function');
		});

		it('should parse the list data into an array of proxies', function(done) {

			var samples = require('../../samples/proxylisten/listPage');
			var type = 'httphttps';

			async.each(samples, function(listHtml, next) {

				proxylisten.parseListHtml(listHtml, type, function(error, proxies) {

					if (error) {
						return next(error);
					}

					try {

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
});
