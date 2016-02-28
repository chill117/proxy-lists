'use strict';

var _ = require('underscore');
var expect = require('chai').expect;

var ProxyLists = require('../../../index');

var listSourcesOptions = {
	sourcesBlackList: []
};

if (process.env.TRAVIS_CI) {
	listSourcesOptions.sourcesBlackList.push('freeproxylist');
}

if (!process.env.PROXY_LISTS_KINGPROXIES_API_KEY) {
	listSourcesOptions.sourcesBlackList.push('kingproxies');
}

var sources = ProxyLists.listSources(listSourcesOptions);

_.each(sources, function(source) {

	var name = source.name;

	source = ProxyLists._sources[name];

	describe('source.' + name, function() {

		describe('getProxies([options, ]cb)', function() {

			it('should be a function', function() {

				expect(source.getProxies).to.be.a('function');
			});

			it('should return valid proxies', function(done) {

				this.timeout(30000);

				var gotProxies = false;
				var cb = _.once(done);

				var options = {
					anonymityLevels: ['anonymous', 'elite', 'transparent'],
					protocols: ['http', 'https', 'socks4', 'socks5'],
					sample: true
				};

				if (process.env.PROXY_LISTS_KINGPROXIES_API_KEY) {
					options.kingproxies = {};
					options.kingproxies.apiKey = process.env.PROXY_LISTS_KINGPROXIES_API_KEY;
				}

				options = ProxyLists.prepareOptions(options);

				var gettingProxies = source.getProxies(options);

				gettingProxies.on('error', cb);

				gettingProxies.on('data', function(proxies) {

					gotProxies = true;

					var invalidProxies = [];

					try {

						expect(proxies).to.be.an('array');
						expect(proxies.length > 0).to.equal(true);

						_.each(proxies, function(proxy) {

							try {

								expect(ProxyLists.isValidProxy(proxy)).to.equal(true);

							} catch (error) {

								invalidProxies.push(proxy);
							}
						});

						expect(invalidProxies).to.deep.equal([]);

					} catch (error) {
						return cb(error);
					}
				});

				gettingProxies.on('end', function() {

					try {

						expect(gotProxies).to.equal(true);

					} catch (error) {
						return cb(error);
					}

					cb();
				});
			});
		});
	});
});
