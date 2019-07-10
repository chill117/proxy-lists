'use strict';

var _ = require('underscore');
var expect = require('chai').expect;

var ProxyLists = require('../../../index');

describe.only('source.getProxies([options, ]cb)', function() {

	var sourceNames = (process.env.SOURCES && process.env.SOURCES.split(',')) || null;

	var sources = _.chain(ProxyLists.sourcer.sources).map(function(source, name) {
		source = _.clone(source);
		source.name = name;
		return source;
	}).filter(function(source) {
		return !sourceNames || _.contains(sourceNames, source.name);
	}).value();

	_.each(sources, function(source) {

		describe('source.' + source.name, function() {

			it('"getProxies" function exists', function() {
				expect(source.getProxies).to.be.a('function');
			});

			it('should return valid proxies', function(done) {

				if (process.env.TRAVIS_CI) {
					console.log('Skipping this test because it doesn\'t run well on travis-ci platform.');
					return this.skip();
				}

				this.timeout(30000);

				// Don't validate IP addresses for some sources.
				var validateIp = ['bitproxies'].indexOf(source.name) === -1;

				function isValidProxy(proxy) {
					return ProxyLists.isValidProxy(proxy, {
						validateIp: validateIp
					});
				}

				var gotProxies = false;
				var cb = _.once(function(error) {
					if (error) return done(error);
					if (!gotProxies) return done(new Error('Scraped zero proxies!'));
					done();
				});

				var options = { sourceOptions: {} };
				switch (source.name) {
					case 'bitproxies':
						options.sourceOptions.bitproxies = { apiKey: 'TEST_API_KEY' };
						break;
				}
				options = _.extend(options, {
					filterMode: 'loose',
					countries: null,
					anonymityLevels: null,
					protocols: null,
					sample: true,
				});

				ProxyLists.getProxiesFromSource(source.name, options)
					.on('data', function(proxies) {
						gotProxies = true;
						var invalidProxies = [];
						try {
							expect(proxies).to.be.an('array');
							expect(proxies).to.not.have.length(0);
							var invalidProxies = _.reject(proxies, function(proxy) {
								return isValidProxy(proxy);
							});
							var percentInvalid = (invalidProxies.length / proxies.length) * 100;
							// Allow up to 40% of the proxies to be invalid.
							if (percentInvalid > 40) {
								// Print up to 10 invalid proxies for debugging.
								console.log(invalidProxies.slice(0, Math.min(10, invalidProxies.length)));
								throw new Error('Too many invalid proxies from source: "' + source.name + '"');
							}
						} catch (error) {
							return cb(error);
						}
					})
					.on('error', cb)
					.once('end', cb);
			});
		});
	});
});
