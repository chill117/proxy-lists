'use strict';

var _ = require('underscore');
var expect = require('chai').expect;

var ProxyLists = require('../../../index');

var sources = ProxyLists.listSources({
	// sourcesBlackList: ['kingproxies', 'freeproxylist']
});

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

				var doneCalled = false;
				var cb = function(error) {

					if (doneCalled) {
						// Already called done().
						return;
					}

					doneCalled = true;
					done(error);
				};

				var options = {
					anonymityLevels: ['anonymous', 'elite', 'transparent'],
					protocols: ['http', 'https', 'socks4', 'socks5'],
					sample: true
				};

				options = ProxyLists.prepareOptions(options);

				var gettingProxies = source.getProxies(options);

				gettingProxies.on('error', cb);

				gettingProxies.on('data', function(proxies) {

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

				gettingProxies.on('end', cb);
			});
		});
	});
});
