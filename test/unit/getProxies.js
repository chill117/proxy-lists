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
			ipTypes: ['ipv4', 'ipv6'],
		}).on('end', function() {
			done();
		});
	});

	describe('options', function() {

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
});
