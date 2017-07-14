'use strict';

var _ = require('underscore');
var async = require('async');
var expect = require('chai').expect;

describe('source.premproxy', function() {

	var Source = require('../../../sources/premproxy');

	describe('parsePageHtml(html, cb)', function() {

		it('should be a function', function() {
			expect(Source.parsePageHtml).to.be.a('function');
		});

	});

	describe('parsePageHtml(html, cb)', function() {

		it('should be a function', function() {
			expect(Source.parsePageHtml).to.be.a('function');
		});

		it('should parse the HTML into an array of proxies', function(done) {

			var samples = require('../../samples/premproxy/pageHtml');

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
							expect(proxy.anonymityLevel).to.be.a('string');
							expect(proxy.protocols).to.be.a('array');
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
