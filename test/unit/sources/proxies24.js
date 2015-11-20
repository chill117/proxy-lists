'use strict';

var _ = require('underscore');
var async = require('async');
var expect = require('chai').expect;

var ProxyLists = require('../../../index');

describe('source.proxies24', function() {

	var proxies24 = require('../../../sources/proxies24');

	describe('parseStartingPageHtmlForLists(startingPageHtml, protocols, cb)', function() {

		it('should be a function', function() {

			expect(proxies24.parseStartingPageHtmlForLists).to.be.a('function');
		});

		it('should parse starting page(s) HTML into an array of lists', function(done) {

			var samples = require('../../samples/proxies24/startingPages');

			var startingPages = [
				{
					html: samples.http,
					protocols: ['http']
				},
				{
					html: samples.https,
					protocols: ['https']
				},
				{
					html: samples.socks,
					protocols: ['socks5']
				}
			];

			async.each(startingPages, function(startingPage, next) {

				var startingPageHtml = startingPage.html;
				var protocols = startingPage.protocols;

				proxies24.parseStartingPageHtmlForLists(startingPageHtml, protocols, function(error, lists) {

					try {
						expect(error).to.equal(null);
						expect(lists).to.be.an('array');
						expect(lists.length > 0).to.equal(true);

						_.each(lists, function(list) {
							expect(list.protocol).to.not.equal(undefined);
							expect(_.contains(protocols, list.protocol)).to.equal(true);
							expect(list.url).to.not.equal(undefined);
						});
					} catch (error) {
						return next(error);
					}

					next();
				});

			}, done);
		});
	});

	describe('parseListPageHtml(listPageHtml, protocol, cb)', function() {

		it('should be a function', function() {

			expect(proxies24.parseListPageHtml).to.be.a('function');
		});

		it('should parse starting page(s) HTML into an array of lists', function(done) {

			var samples = require('../../samples/proxies24/listPages');

			var listPages = [
				{
					html: samples.http,
					protocol: 'http'
				},
				{
					html: samples.https,
					protocol: 'https'
				},
				{
					html: samples.socks,
					protocol: 'socks5'
				}
			];

			async.each(listPages, function(listPage, next) {

				var listPageHtml = listPage.html;
				var protocol = listPage.protocol;

				proxies24.parseListPageHtml(listPageHtml.toString(), protocol, function(error, proxies) {

					try {
						expect(error).to.equal(null);
						expect(proxies).to.be.an('array');
						expect(proxies.length > 0).to.equal(true);

						_.each(proxies, function(proxy) {
							expect(proxy.ip_address).to.not.equal(undefined);
							expect(proxy.ip_address).to.be.a('string');
							expect(proxy.port).to.not.equal(undefined);
							expect(proxy.port).to.be.a('number');
							expect(proxy.port).to.equal(parseInt(proxy.port));
							expect(_.contains(proxy.protocols, protocol)).to.equal(true);
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
