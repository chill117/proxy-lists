'use strict';

var _ = require('underscore');
var EventEmitter = require('events').EventEmitter || require('events');
var expect = require('chai').expect;

var ProxyLists = require('../../index');

describe('getProxies([options, ]cb)', function() {

	var sourcesBefore;

	beforeEach(function() {
		sourcesBefore = _.clone(ProxyLists._sources);
	});

	afterEach(function() {
		ProxyLists._sources = sourcesBefore;
	});

	it('should be a function', function() {

		expect(ProxyLists.getProxies).to.be.a('function');
	});

	it('should call getProxies() for all sources', function() {

		var testSources = ['somewhere', 'somewhere-else'];
		var called = {};

		ProxyLists._sources = {};

		_.each(testSources, function(name) {
			ProxyLists.addSource(name, {
				getProxies: function() {
					var emitter = new EventEmitter();
					called[name] = true;
					return emitter;
				}
			});
		});

		ProxyLists.getProxies();

		_.each(testSources, function(name) {
			expect(called[name]).to.equal(true);
		});
	});

	describe('options', function() {

		describe('series', function() {

			describe('TRUE', function() {

				it('should get proxies from all sources in series', function() {

					var testSources = ['somewhere', 'somewhere-else'];
					var gettingProxiesFromSource = {};

					ProxyLists._sources = {};

					_.each(testSources, function(name) {
						ProxyLists.addSource(name, {
							getProxies: function() {
								var emitter = new EventEmitter();
								gettingProxiesFromSource[name] = true;
								return emitter;
							}
						});
					});

					var options = {
						series: true
					};

					ProxyLists.getProxies(options);

					expect(_.keys(gettingProxiesFromSource)).to.have.length(1);
				});
			});

			describe('FALSE', function() {

				it('should get proxies from all sources in parallel', function() {

					var testSources = ['somewhere', 'somewhere-else'];
					var gettingProxiesFromSource = {};

					ProxyLists._sources = {};

					_.each(testSources, function(name) {
						ProxyLists.addSource(name, {
							getProxies: function() {
								var emitter = new EventEmitter();
								gettingProxiesFromSource[name] = true;
								return emitter;
							}
						});
					});

					var options = {
						series: false
					};

					ProxyLists.getProxies(options);

					_.each(testSources, function(name) {
						expect(gettingProxiesFromSource[name]).to.equal(true);
					});
				});
			});
		});
	});
});
