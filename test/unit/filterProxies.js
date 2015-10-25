'use strict';

var proxies = require('./fixtures/proxies');

describe('filterProxies([options, ]cb)', function() {

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

		describe('types', function() {

			var types = {
				http: function(type) {
					return type === 'http';
				},
				https: function(type) {
					return type === 'https';
				},
				socks4: function(type) {
					return _.contains(['socks4', 'socks4/5'], type);
				},
				socks5: function(type) {
					return _.contains(['socks5', 'socks4/5'], type);
				}
			};

			_.each(types, function(test, type) {

				it('should return only proxies of type "' + type + '"', function() {

					var options = {
						types: [type]
					};

					var filtered = ProxyLists.filterProxies(proxies, options);

					expect(filtered).to.be.an('array');
					expect(filtered.length > 0).to.equal(true);

					_.each(filtered, function(proxy) {
						expect(test(proxy.type)).to.equal(true);
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
