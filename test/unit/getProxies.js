'use strict';

var _ = require('underscore');
var EventEmitter = require('events').EventEmitter || require('events');
var expect = require('chai').expect;

var ProxyLists = require('../../index');

describe('getProxies([options, ]cb)', function() {

	var sourcesBefore;

	beforeEach(function() {
		sourcesBefore = _.clone(ProxyLists.sourcer.sources);
	});

	afterEach(function() {
		ProxyLists.sourcer.sources = sourcesBefore;
	});

	it('should be a function', function() {

		expect(ProxyLists.getProxies).to.be.a('function');
	});

	it('should call getProxies() for all sources', function(done) {

		var testSources = ['somewhere', 'somewhere-else'];
		var called = {};

		ProxyLists.sourcer.sources = {};

		_.each(testSources, function(name) {
			ProxyLists.addSource(name, {
				getProxies: function() {
					var emitter = new EventEmitter();
					called[name] = true;
					var onEnd = _.bind(emitter.emit, emitter, 'end');
					_.defer(onEnd);
					return emitter;
				}
			});
		});

		ProxyLists.getProxies().on('end', function() {

			try {
				_.each(testSources, function(name) {
					expect(called[name]).to.equal(true);
				});
			} catch (error) {
				return done(error);
			}

			done();
		});
	});

	it('source with ipv6 addresses', function(done) {

		ProxyLists.sourcer.sources = {};

		ProxyLists.addSource('ipv6test', {
			getProxies: function() {
				var emitter = new EventEmitter();
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

		ProxyLists.getProxies({ ipTypes: ['ipv4', 'ipv6'] }).on('end', function() {
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

					ProxyLists.sourcer.sources = {};

					_.each(testSources, function(name) {
						ProxyLists.addSource(name, {
							getProxies: function() {
								var emitter = new EventEmitter();
								var onEnd = _.bind(emitter.emit, emitter, 'end');
								_.defer(_.bind(gettingProxiesCalledForSource, undefined, name));
								_.defer(onEnd);
								return emitter;
							}
						});
					});

					var options = {
						series: true
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

					ProxyLists.sourcer.sources = {};

					_.each(testSources, function(name) {
						ProxyLists.addSource(name, {
							getProxies: function() {
								gettingProxiesFromSource[name] = true;
								return new EventEmitter();
							}
						});
					});

					var options = {
						series: false
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
});
