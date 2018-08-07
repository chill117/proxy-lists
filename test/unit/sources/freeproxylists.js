'use strict';

var _ = require('underscore');
var async = require('async');
var expect = require('chai').expect;

describe('source.freeproxylists', function() {

	var freeproxylists = require('../../../sources/freeproxylists');

	describe('listUrlToDataUrl(listUrl)', function() {

		it('should be a function', function() {

			expect(freeproxylists.listUrlToDataUrl).to.be.a('function');
		});

		it('should correctly convert list URLs into data URLs', function() {

			var listUrlsToDataUrls = {
				'anon/d1445543510.html': 'http://www.freeproxylists.com/load_anon_d1445543510.html',
				'elite/d1445543510.html': 'http://www.freeproxylists.com/load_elite_d1445543510.html',
				'elite/d1445464903.html': 'http://www.freeproxylists.com/load_elite_d1445464903.html'
			};

			_.each(listUrlsToDataUrls, function(dataUrl, listUrl) {
				expect(freeproxylists.listUrlToDataUrl(listUrl)).to.equal(dataUrl);
			});
		});
	});

	describe('prepareStartingPageUrls(options)', function() {

		it('should be a function', function() {

			expect(freeproxylists.prepareStartingPageUrls).to.be.a('function');
		});

		describe('options', function() {

			describe('anonymityLevels', function() {

				it('should return transparent starting page URL', function() {

					var options = {
						anonymityLevels: ['transparent'],
						protocols: ['https']
					};

					var startingPageUrls = freeproxylists.prepareStartingPageUrls(options);

					expect(startingPageUrls).to.be.an('object');
					expect(startingPageUrls.transparent).to.not.be.undefined;
					expect(startingPageUrls.transparent).to.be.a('string');
					expect(_.values(startingPageUrls)).to.have.length(1);
				});

				it('"socks": should return only socks starting page URL', function() {

					var options = {
						anonymityLevels: [],
						protocols: ['socks4', 'socks5']
					};

					var startingPageUrls = freeproxylists.prepareStartingPageUrls(options);

					expect(startingPageUrls).to.be.an('object');
					expect(startingPageUrls.socks).to.not.be.undefined;
					expect(startingPageUrls.socks).to.be.a('string');
					expect(_.values(startingPageUrls)).to.have.length(1);
				});
			});

			describe('sample', function() {

				it('should return only a few starting page URLs', function() {

					var options = {
						anonymityLevels: ['transparent', 'anonymous', 'elite'],
						protocols: ['https', 'http', 'socks4', 'socks5'],
						sample: true
					};

					var startingPageUrls = freeproxylists.prepareStartingPageUrls(options);

					expect(startingPageUrls).to.be.an('object');
					expect(_.values(startingPageUrls).length > 0).to.equal(true);
					expect(_.values(startingPageUrls).length < 5).to.equal(true);
				});
			});
		});
	});

	describe('parseListData(listData, listUrl, cb)', function() {

		it('should be a function', function() {

			expect(freeproxylists.parseListData).to.be.a('function');
		});

		it('should handle badly structured XML', function(done) {

			var list = {
				url: 'anon/somesample.html',
				data: '<?xml version="1.0" encoding="utf-8"?><missingroot></missingroot>'
			};

			freeproxylists.parseListData(list.data, list.url, function(error, proxies) {

				expect(error).to.not.equal(null);
				expect(proxies).to.equal(undefined);
				done();
			});
		});

		it('should parse the XML data into a JSON array of proxies', function(done) {

			var samples = require('../../samples/freeproxylists/listData');

			async.each(samples, function(list, next) {

				freeproxylists.parseListData(list.data, list.url, function(error, proxies) {

					try {

						expect(error).to.equal(null);
						expect(proxies).to.be.an('array');
						expect(proxies).to.deep.equal([
							{
								ipAddress: '123.123.2.42',
								port: 8080,
								protocols: ['http'],
								anonymityLevel: 'anonymous'
							},
							{
								ipAddress: '123.209.64.13',
								port: 8118,
								protocols: ['http'],
								anonymityLevel: 'anonymous'
							},
							{
								ipAddress: '234.221.233.142',
								port: 3128,
								protocols: ['https'],
								anonymityLevel: 'anonymous'
							},
							{
								ipAddress: '123.123.124.179',
								port: 80,
								protocols: ['http'],
								anonymityLevel: 'anonymous'
							},
							{
								ipAddress: '123.123.114.49',
								port: 80,
								protocols: ['http'],
								anonymityLevel: 'anonymous'
							},
							{
								ipAddress: '123.123.114.36',
								port: 80,
								protocols: ['http'],
								anonymityLevel: 'anonymous'
							},
							{
								ipAddress: '123.123.112.71',
								port: 80,
								protocols: ['http'],
								anonymityLevel: 'anonymous'
							},
							{
								ipAddress: '234.123.45.21',
								port: 8081,
								protocols: ['https'],
								anonymityLevel: 'anonymous'
							}
						]);

					} catch (error) {
						return next(error);
					}

					next();
				});

			}, done);
		});
	});
});
