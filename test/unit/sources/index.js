'use strict';

describe('sources', function() {

	var sources = ProxyLists.listSources();

	_.each(sources, function(source) {

		var name = source.name;

		source = ProxyLists._sources[name];

		describe('"' + name + '"', function() {

			describe('getProxies([options, ]cb)', function() {

				it('should be a function', function() {

					expect(source.getProxies).to.be.a('function');
				});

				it('should return valid proxies', function(done) {

					this.timeout(30000);

					var options = {
						anonymityLevels: ['anonymous', 'elite', 'transparent'],
						types: ['http', 'https', 'socks4', 'socks5'],
						sample: true
					};

					source.getProxies(options, function(error, proxies) {

						var invalidProxies = [];

						try {

							expect(error).to.equal(null);
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
							return done(error);
						}

						done();
					});
				});
			});
		});
	});
});
