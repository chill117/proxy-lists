'use strict';

var _ = require('underscore');
var async = require('async');
var expect = require('chai').expect;

var ProxyLists = require('../../index');

var fixtures = require('./fixtures');

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

	it('should call getProxies() for all sources', function(done) {

		var testSources = ['somewhere', 'somewhere-else'];
		var called = [];

		ProxyLists._sources = {};

		_.each(testSources, function(name) {
			ProxyLists.addSource(name, {
				getProxies: function(options, cb) {
					called.push(name);
					cb();
				}
			});
		});

		ProxyLists.getProxies(function() {

			try {

				_.each(_.keys(ProxyLists._sources), function(name) {
					expect(_.contains(called, name)).to.equal(true);
				});

			} catch (error) {
				return done(error);
			}

			done();
		});
	});

	it('should not fail completely when an error occurs in one proxy source', function(done) {

		var sampleProxies = fixtures.proxies;

		var testSources = {
			'successful-source': {
				getProxies: function(options, cb) {
					cb(null, sampleProxies);
				}
			},
			'failing-source': {
				getProxies: function(options, cb) {
					cb(new Error('Some error.'));
				}
			}
		};

		ProxyLists._sources = {};

		_.each(testSources, function(source, name) {
			ProxyLists.addSource(name, source);
		});

		ProxyLists.getProxies({
			countries: null,
			protocols: null,
			anonymityLevels: null
		}, function(error, proxies) {

			try {
				expect(error).to.equal(null);
				expect(proxies).to.be.an('array');
				expect(proxies).to.deep.equal(sampleProxies);
			} catch (error) {
				return done(error);
			}

			done();
		});
	});
});
