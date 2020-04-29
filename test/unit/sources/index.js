'use strict';

var _ = require('underscore');
var expect = require('chai').expect;

var ProxyLists = require('../../../index');

describe('source.getProxies([options, ]cb)', function() {

	var sourcesWhiteList = (process.env.SOURCES && process.env.SOURCES.split(',')) || null;
	var dataSourcer = ProxyLists.prepareDataSourcer();
	var sources = dataSourcer.listSources({
		sourcesWhiteList: sourcesWhiteList,
	});

	_.each(sources, function(source) {

		var definition = dataSourcer.sources[source.name];

		describe('source.' + source.name, function() {

			it('"getProxies" function exists', function() {
				expect(definition.getProxies).to.be.a('function');
			});

			it('should return valid proxies', function(done) {

				if (process.env.TRAVIS_CI) {
					console.log('Skipping this test because it doesn\'t run well on travis-ci platform.');
					return this.skip();
				}

				this.timeout(60000);

				var options = {
					filterMode: 'loose',
					countries: null,
					anonymityLevels: null,
					protocols: null,
					sample: true,
					sampleDataLimit: 200,
					// browser: {
					// 	headless: false,
					// },
				};

				done = _.once(done);

				var proxies = [];
				ProxyLists.getProxiesFromSource(source.name, options)
					.on('data', function(_proxies) {
						proxies.push.apply(proxies, _proxies);
					})
					.on('error', done)
					.once('end', function() {
						try {
							expect(proxies).to.be.an('array');
							expect(proxies).to.not.have.length(0);
							var invalidProxies = _.reject(proxies, function(proxy) {
								return ProxyLists.isValidProxy(proxy);
							});
							var percentInvalid = (invalidProxies.length / proxies.length) * 100;
							// Allow up to 40% of the proxies to be invalid.
							if (percentInvalid > 40) {
								// Print up to 10 invalid proxies for debugging.
								console.log(invalidProxies.slice(0, Math.min(10, invalidProxies.length)));
								throw new Error('Too many invalid proxies from source: "' + source.name + '"');
							}
						} catch (error) {
							return done(error);
						}
						done();
					});
			});
		});
	});
});
