'use strict';

var _ = require('underscore');
var expect = require('chai').expect;

var ProxyLists = require('../../../index');

describe('source.getProxies([options, ]cb)', function() {

	_.each(ProxyLists.sourcer.sources, function(source, name) {

		describe('source.' + name, function() {

			it('should be a function', function() {

				expect(source.getProxies).to.be.a('function');
			});

			it('should return valid proxies', function(done) {

				if (process.env.TRAVIS_CI) {
					console.log('Skipping this test because it doesn\'t run well on travis-ci platform.');
					return this.skip();
				}

				var options = {};

				switch (name) {

					case 'bitproxies':
						if (!process.env.PROXY_LISTS_BITPROXIES_API_KEY) {
							console.log('Skipping this test because bitproxies API key was not found.');
							return this.skip();
						}
						options.bitproxies = {};
						options.bitproxies.apiKey = process.env.PROXY_LISTS_BITPROXIES_API_KEY;
						break;

					case 'kingproxies':
						if (!process.env.PROXY_LISTS_KINGPROXIES_API_KEY) {
							console.log('Skipping this test because kingproxies API key was not found.');
							return this.skip();
						}
						options.kingproxies = {};
						options.kingproxies.apiKey = process.env.PROXY_LISTS_KINGPROXIES_API_KEY;
						break;
				}

				this.timeout(30000);

				// Don't validate IP addresses for some sources.
				var validateIp = ['bitproxies', 'kingproxies'].indexOf(name) === -1;

				function isValidProxy(proxy) {

					return ProxyLists.isValidProxy(proxy, {
						validateIp: validateIp
					});
				}

				var gotProxies = false;
				var cb = _.once(function(error) {

					if (error) {
						return done(error);
					}

					if (!gotProxies) {
						return done(new Error('Expected to get some proxies.'));
					}

					done();
				});

				options = _.extend(options, {
					anonymityLevels: ['anonymous', 'elite', 'transparent'],
					protocols: ['http', 'https', 'socks4', 'socks5'],
					sample: true
				});

				ProxyLists.getProxiesFromSource(name, options)
					.on('data', function(proxies) {

						gotProxies = true;

						var invalidProxies = [];

						try {

							expect(proxies).to.be.an('array');

							if (!(proxies.length > 0)) {
								throw new Error('Expected at least one proxy.');
							}
							_.each(proxies, function(proxy) {
								try {
									expect(isValidProxy(proxy)).to.equal(true);
								} catch (error) {
									invalidProxies.push(proxy);
								}
							});

							var percentInvalid = (invalidProxies.length / proxies.length) * 100;

							// Allow up to 40% of the proxies to be invalid.
							if (percentInvalid > 40) {
								// Print up to 10 invalid proxies for debugging.
								console.log(invalidProxies.slice(0, Math.min(10, invalidProxies.length)));
								throw new Error('Too many invalid proxies from source: "' + name + '"');
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
