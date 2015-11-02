'use strict';

var _ = require('underscore');
var async = require('async');
var expect = require('chai').expect;

var ProxyLists = require('../../index');

describe('getProxiesFromSource(name, [options, ]cb)', function() {

	it('should be a function', function() {

		expect(ProxyLists.getProxiesFromSource).to.be.a('function');
	});

	it('should throw an error if the source does not exist', function() {

		var name = 'does-not-exist';
		var thrownError;

		try {

			ProxyLists.getProxiesFromSource(name, function() { });

		} catch (error) {

			thrownError = error;
		}

		expect(thrownError).to.not.equal(undefined);
		expect(thrownError instanceof Error).to.equal(true);
		expect(thrownError.message).to.equal('Proxy source does not exist: "' + name + '"');
	});

	it('should call getProxies() method of the specified source', function() {

		var name = 'somewhere';
		var called = false;

		ProxyLists.addSource(name, {
			getProxies: function() {
				called = true;
			}
		});

		ProxyLists.getProxiesFromSource(name);
		expect(called).to.equal(true);

		// Clean-up.
		delete ProxyLists._sources[name];
	});
});
