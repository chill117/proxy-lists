'use strict';

var _ = require('underscore');
var expect = require('chai').expect;

var ProxyLists = require('../../index');

describe('getProxies([options, ]cb)', function() {

	var originalDataSourcerClose;
	beforeEach(function() {
		originalDataSourcerClose = ProxyLists.DataSourcer.prototype.close;
	});

	afterEach(function() {
		ProxyLists.DataSourcer.prototype.close = originalDataSourcerClose;
		ProxyLists._sources = [];
	});

	it('should be a function', function() {
		expect(ProxyLists.getProxies).to.be.a('function');
	});

	it('should call getProxies() for all sources', function(done) {

		try {
			var testSources = ['somewhere', 'somewhere-else'];
			var called = {};

			_.each(testSources, function(name) {
				ProxyLists.addSource(name, {
					getProxies: function(options) {
						var emitter = options.newEventEmitter();
						_.defer(function() {
							called[name] = true;
							emitter.emit('end');
						});
						return emitter;
					}
				});
			});

			ProxyLists.getProxies({
				sourcesDir: null,
			}).on('end', function() {

				try {
					_.each(testSources, function(name) {
						expect(called[name]).to.equal(true);
					});
				} catch (error) {
					return done(error);
				}

				done();
			});
		} catch (error) {
			return done(error);
		}
	});

	it('source with ipv6 addresses', function(done) {

		ProxyLists.addSource('ipv6test', {
			getProxies: function(options) {
				var emitter = options.newEventEmitter();
				var onData = _.bind(emitter.emit, emitter, 'data');
				var onEnd = _.bind(emitter.emit, emitter, 'end');
				_.defer(onData, [{
					ipAddress: '1200:0000:AB00:1234:0000:2552:7777:1313',
					port: 80,
					anonymityLevel: 'transparent'
				}])
				_.defer(onEnd);
				return emitter;
			}
		});

		ProxyLists.getProxies({
			sourcesDir: null,
		}).on('end', function() {
			done();
		});
	});

	describe('options', function() {

		describe('unique', function() {

			beforeEach(function() {
				ProxyLists.addSource('duplicates1', {
					getProxies: function(options) {
						var emitter = options.newEventEmitter();
						var onData = _.bind(emitter.emit, emitter, 'data');
						var onEnd = _.bind(emitter.emit, emitter, 'end');
						_.defer(onData, [{
							ipAddress: '118.69.50.154',
							port: 80,
						}, {
							ipAddress: '119.70.52.155',
							port: 9000,
						}, {
							ipAddress: '125.65.54.122',
							port: 8080,
						}]);
						_.defer(onEnd);
						return emitter;
					}
				});
				ProxyLists.addSource('duplicates2', {
					getProxies: function(options) {
						var emitter = options.newEventEmitter();
						var onData = _.bind(emitter.emit, emitter, 'data');
						var onEnd = _.bind(emitter.emit, emitter, 'end');
						_.defer(onData, [{
							ipAddress: '129.64.41.154',
							port: 80,
						}, {
							ipAddress: '119.70.52.155',
							port: 9000,
						}, {
							ipAddress: '125.65.54.122',
							port: 8080,
						}]);
						_.defer(onEnd);
						return emitter;
					}
				});
			});

			describe('TRUE', function() {

				it('should provide only unique proxies', function(done) {

					var proxies = [];
					ProxyLists.getProxies({
						sourcesDir: null,
						unique: true,
					}).on('data', function(_proxies) {
						proxies.push.apply(proxies, _proxies);
					}).on('end', function() {
						try {
							expect(proxies).to.have.length(4);
						} catch (error) {
							return done(error);
						}
						done();
					});
				});
			});

			describe('FALSE', function() {

				it('should provide only unique proxies', function(done) {

					var proxies = [];
					ProxyLists.getProxies({
						sourcesDir: null,
						unique: false,
					}).on('data', function(_proxies) {
						proxies.push.apply(proxies, _proxies);
					}).on('end', function() {
						try {
							expect(proxies).to.have.length(6);
						} catch (error) {
							return done(error);
						}
						done();
					});
				});
			});
		});

		describe('series', function() {

			describe('TRUE', function() {

				it('should get proxies from all sources in series', function(done) {

					var testSources = ['somewhere', 'somewhere-else'];
					var called = {};

					var gettingProxiesCalledForSource = function(name) {

						var nextExpected = testSources[_.keys(called).length];

						try {
							expect(name).to.equal(nextExpected);
						} catch (error) {
							return done(error);
						}

						called[name] = true;
					};

					_.each(testSources, function(name) {
						ProxyLists.addSource(name, {
							getProxies: function(options) {
								var emitter = options.newEventEmitter();
								var onEnd = _.bind(emitter.emit, emitter, 'end');
								_.defer(_.bind(gettingProxiesCalledForSource, undefined, name));
								_.defer(onEnd);
								return emitter;
							}
						});
					});

					var options = {
						sourcesDir: null,
						series: true,
					};

					ProxyLists.getProxies(options).on('end', function() {

						try {
							expect(_.keys(called)).to.have.length(testSources.length);
						} catch (error) {
							return done(error);
						}

						done();
					});
				});
			});

			describe('FALSE', function() {

				it('should get proxies from all sources in parallel', function(done) {

					var testSources = ['somewhere', 'somewhere-else'];
					var gettingProxiesFromSource = {};

					_.each(testSources, function(name) {
						ProxyLists.addSource(name, {
							getProxies: function(options) {
								gettingProxiesFromSource[name] = true;
								return options.newEventEmitter();
							}
						});
					});

					var options = {
						sourcesDir: null,
						series: false,
					};

					ProxyLists.getProxies(options);

					_.defer(function() {
						_.each(testSources, function(name) {
							expect(gettingProxiesFromSource[name]).to.equal(true);
						});
						done();
					});
				});
			});
		});
	});

	it('calls dataSourcer.close method after end event', function(done) {

		var sourceNames = ['one', 'two', 'three'];
		_.each(sourceNames, function(name) {
			ProxyLists.addSource(name, {
				getProxies: function(options) {
					var emitter = options.newEventEmitter();
					_.defer(function() {
						emitter.emit('end');
					});
					return emitter;
				}
			});
		});

		var closeCalled = false;
		ProxyLists.DataSourcer.prototype.close = function() {
			closeCalled = true;
			return originalDataSourcerClose.apply(this, arguments);
		};

		ProxyLists.getProxies({
			sourcesDir: null,
		}).on('end', function() {
			try {
				expect(closeCalled).to.equal(true);
			} catch (error) {
				return done(error);
			}
			done();
		});
	});

	describe('health checks', function() {

		var sourcesWhiteList = (process.env.SOURCES && process.env.SOURCES.split(',')) || null;
		var dataSourcer = ProxyLists.prepareDataSourcer();
		var sources = dataSourcer.listSources({
			sourcesWhiteList: sourcesWhiteList,
		});

		_.each(sources, function(source) {

			var definition = dataSourcer.sources[source.name];

			describe(source.name, function() {

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
						// 	slowMo: 50,
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
});
