'use strict';

var _ = require('underscore');
var async = require('async');
var expect = require('chai').expect;

describe('source.proxies24', function() {

	var proxies24 = require('../../../sources/proxies24');

	describe('parseStartingPageHtml(startingPage, cb)', function() {

		it('should be a function', function() {

			expect(proxies24.parseStartingPageHtml).to.be.a('function');
		});

		it('should parse starting page(s) HTML into an array of lists', function(done) {

			var samples = require('../../samples/proxies24/startingPages');

			var startingPages = [
				{
					html: samples.http,
					protocols: ['http']
				}
			];

			async.each(startingPages, function(startingPage, next) {

				proxies24.parseStartingPageHtml(startingPage, function(error, lists) {

					try {
						expect(error).to.equal(null);
						expect(lists).to.be.an('array');
						expect(lists.length > 0).to.equal(true);

						_.each(lists, function(list) {
							expect(list.protocol).to.not.be.undefined;
							expect(_.contains(startingPage.protocols, list.protocol)).to.equal(true);
							expect(list.url).to.not.be.undefined;
						});
					} catch (error) {
						return next(error);
					}

					next();
				});

			}, done);
		});
	});

	describe('parseListPageHtml(list, cb)', function() {

		it('should be a function', function() {

			expect(proxies24.parseListPageHtml).to.be.a('function');
		});

		it('should parse starting page(s) HTML into an array of lists', function(done) {

			var samples = require('../../samples/proxies24/listPages');

			var lists = [
				{
					html: samples.http,
					protocol: 'http'
				}
			];

			async.each(lists, function(list, next) {

				proxies24.parseListPageHtml(list, function(error, proxies) {

					try {
						expect(error).to.equal(null);
						expect(proxies).to.be.an('array');
						expect(proxies.length > 0).to.equal(true);

						_.each(proxies, function(proxy) {
							expect(proxy.ipAddress).to.not.be.undefined;
							expect(proxy.ipAddress).to.be.a('string');
							expect(proxy.port).to.not.be.undefined;
							expect(proxy.port).to.be.a('number');
							expect(proxy.port).to.equal(parseInt(proxy.port));
							expect(_.contains(proxy.protocols, list.protocol)).to.equal(true);
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
