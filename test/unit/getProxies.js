'use strict';

var _ = require('underscore');
var async = require('async');
var EventEmitter = require('events');
var expect = require('chai').expect;

var ProxyLists = require('../../index');

describe('getProxies([options, ]cb)', function() {

	var fixtures = require('../fixtures');

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
		var called = [];

		ProxyLists._sources = {};

		_.each(testSources, function(name) {
			ProxyLists.addSource(name, {
				getProxies: function() {
					called.push(name);
					var emitter = new EventEmitter();
					return emitter;
				}
			});
		});

		ProxyLists.getProxies();

		_.each(_.keys(ProxyLists._sources), function(name) {
			expect(_.contains(called, name)).to.equal(true);
		});
	});
});
