'use strict';

var _ = require('underscore');
var expect = require('chai').expect;

var ProxyLists = require('../../index');

describe('filterProxies([options, ]cb)', function() {

	var proxies = require('../fixtures/proxies');

	describe('options', function() {

		describe('countries', function() {

			var countries = ['ca', 'us', 'sk'];

			_.each(countries, function(country) {

				it('should return only proxies from ' + ProxyLists._countries[country], function() {

					var options = {
						countries: {}
					};

					options.countries[country] = true;

					var filtered = ProxyLists.filterProxies(proxies, options);

					expect(filtered).to.be.an('array');
					expect(filtered.length > 0).to.equal(true);

					_.each(filtered, function(proxy) {
						expect(proxy.country).to.equal(country);
					});
				});
			});
		});

		describe('protocols', function() {

			_.each(ProxyLists._protocols, function(protocol) {

				it('should return only proxies of protocol "' + protocol + '"', function() {

					var options = {
						protocols: [protocol]
					};

					var filtered = ProxyLists.filterProxies(proxies, options);

					expect(filtered).to.be.an('array');
					expect(filtered.length > 0).to.equal(true);

					_.each(filtered, function(proxy) {
						expect(_.contains(proxy.protocols, protocol)).to.equal(true);
					});
				});
			});
		});

		describe('anonymityLevels', function() {

			var anonymityLevels = [
				'transparent',
				'anonymous',
				'elite'
			];

			_.each(anonymityLevels, function(anonymityLevel) {

				it('should return only proxies with anonymity level of "' + anonymityLevel + '"', function() {

					var options = {
						anonymityLevels: [anonymityLevel]
					};

					var filtered = ProxyLists.filterProxies(proxies, options);

					expect(filtered).to.be.an('array');
					expect(filtered.length > 0).to.equal(true);

					_.each(filtered, function(proxy) {
						expect(proxy.anonymityLevel).to.equal(anonymityLevel);
					});
				});
			});
		});

		describe('countriesBlackList', function() {

			var countriesBlackList = ['ca', 'sk', 'de'];

			_.each(countriesBlackList, function(country) {

				it('should exclude proxies from ' + ProxyLists._countries[country], function() {

					var options = {
						countriesBlackList: {}
					};

					options.countriesBlackList[country] = true;

					var filtered = ProxyLists.filterProxies(proxies, options);

					expect(filtered).to.be.an('array');
					expect(filtered.length > 0).to.equal(true);

					_.each(filtered, function(proxy) {
						expect(proxy.country).to.not.equal(country);
					});
				});
			});
		});

		describe('filterMode', function() {

			describe('loose: include proxies with NULL or missing values', function() {

				it('countries', function() {

					var options = {
						filterMode: 'loose',
						countries: { 'us': true, 'ca': true }
					};

					var toBeFiltered = [
						{
							ipAddress: '127.22.231.1',
							port: 8080,
							country: 'gb'
						},
						{
							ipAddress: '127.1.2.2',
							port: 8888,
							country: 'us'
						},
						{
							ipAddress: '127.1.1.4',
							port: 6000,
							country: null
						},
						{
							ipAddress: '127.1.81.4',
							port: 6000
						}
					];

					var filtered = ProxyLists.filterProxies(toBeFiltered, options);
					expect(filtered).to.be.an('array');
					expect(filtered.length).to.equal(3);
				});

				it('countriesBlackList', function() {

					var options = {
						filterMode: 'loose',
						countriesBlackList: { 'de': true, 'gb': true }
					};

					var toBeFiltered = [
						{
							ipAddress: '127.22.231.1',
							port: 8080,
							country: 'us'
						},
						{
							ipAddress: '127.1.2.2',
							port: 8888,
							country: 'gb'
						},
						{
							ipAddress: '127.1.1.4',
							port: 6000,
							country: null
						},
						{
							ipAddress: '127.1.81.4',
							port: 6000
						}
					];

					var filtered = ProxyLists.filterProxies(toBeFiltered, options);
					expect(filtered).to.be.an('array');
					expect(filtered.length).to.equal(3);
				});

				it('anonymityLevels', function() {

					var options = {
						filterMode: 'loose',
						anonymityLevels: ['elite']
					};

					var toBeFiltered = [
						{
							ipAddress: '127.22.231.1',
							port: 8080,
							anonymityLevel: 'anonymous'
						},
						{
							ipAddress: '127.1.2.2',
							port: 8888,
							anonymityLevel: 'elite'
						},
						{
							ipAddress: '127.1.1.4',
							port: 6000,
							anonymityLevel: null
						},
						{
							ipAddress: '127.1.81.4',
							port: 6000
						}
					];

					var filtered = ProxyLists.filterProxies(toBeFiltered, options);
					expect(filtered).to.be.an('array');
					expect(filtered.length).to.equal(3);
				});

				it('protocols', function() {

					var options = {
						filterMode: 'loose',
						protocols: ['http', 'https']
					};

					var toBeFiltered = [
						{
							ipAddress: '127.22.231.1',
							port: 8080,
							protocols: ['socks4']
						},
						{
							ipAddress: '127.1.2.2',
							port: 8888,
							protocols: ['https']
						},
						{
							ipAddress: '127.1.1.4',
							port: 6000,
							protocols: null
						},
						{
							ipAddress: '127.1.81.4',
							port: 6000
						}
					];

					var filtered = ProxyLists.filterProxies(toBeFiltered, options);
					expect(filtered).to.be.an('array');
					expect(filtered.length).to.equal(3);
				});
			});
		});
	});
});
