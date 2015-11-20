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
	});
});
