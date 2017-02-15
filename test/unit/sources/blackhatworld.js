'use strict';

var _ = require('underscore');
var async = require('async');
var expect = require('chai').expect;

describe('source.blackhatworld', function() {

	var Source = require('../../../sources/blackhatworld');

	describe('parseForumThreadHtml(html, cb)', function() {

		it('should be a function', function() {
			expect(Source.parseForumThreadHtml).to.be.a('function');
		});

		it('should parse the HTML for the last page URL', function(done) {

			var samples = require('../../samples/blackhatworld/threadHtml');

			async.each(samples, function(html, next) {

				Source.parseForumThreadHtml(html, function(error, url) {

					try {
						expect(error).to.equal(null);
						expect(url).to.be.a('string');
						expect(url.indexOf('://') !== -1).to.equal(true);
					} catch (error) {
						return next(error);
					}

					next();
				});

			}, done);
		});
	});

	describe('parseLastPageOfThreadHtml(html, cb)', function() {

		it('should be a function', function() {
			expect(Source.parseLastPageOfThreadHtml).to.be.a('function');
		});

		it('should parse the HTML into an array of proxies', function(done) {

			var samples = require('../../samples/blackhatworld/threadHtml');

			async.each(samples, function(html, next) {

				Source.parseLastPageOfThreadHtml(html, function(error, proxies) {

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
