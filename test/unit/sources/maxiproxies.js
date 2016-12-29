'use strict';

var _ = require('underscore');
var async = require('async');
var expect = require('chai').expect;

describe('source.maxiproxies', function() {

	var Source = require('../../../sources/maxiproxies');

	describe('parseIndexPageHtml(html, cb)', function() {

		it('should be a function', function() {

			expect(Source.parseIndexPageHtml).to.be.a('function');
		});

		it('should parse the HTML into an array of URLs', function(done) {

			var samples = require('../../samples/maxiproxies/indexPageHtml');

			async.each(samples, function(html, next) {

				Source.parseIndexPageHtml(html, function(error, urls) {

					try {

						expect(error).to.equal(null);
						expect(urls).to.be.an('array');
						expect(urls.length > 0).to.equal(true);

						_.each(urls, function(url) {
							expect(url).to.be.a('string');
							expect(url).to.not.equal('');
						});

					} catch (error) {
						return next(error);
					}

					next();
				});

			}, done);
		});
	});

	describe('parsePageHtml(html, cb)', function() {

		it('should be a function', function() {

			expect(Source.parsePageHtml).to.be.a('function');
		});

		it('should parse the HTML into an array of proxies', function(done) {

			var samples = require('../../samples/maxiproxies/pageHtml');

			async.each(samples, function(html, next) {

				Source.parsePageHtml(html, function(error, proxies) {

					try {

						expect(error).to.equal(null);
						expect(proxies).to.be.an('array');
						expect(proxies.length > 0).to.equal(true);

						_.each(proxies, function(proxy) {
							expect(proxy.ipAddress).to.be.a('string');
							expect(proxy.ipAddress).to.not.equal('');
							expect(proxy.port).to.be.a('number');
							expect(!_.isNaN(proxy.port)).to.equal(true);
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
