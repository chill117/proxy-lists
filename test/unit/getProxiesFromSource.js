'use strict';

var _ = require('underscore');
var EventEmitter = require('events').EventEmitter || require('events');
var expect = require('chai').expect;

var ProxyLists = require('../../index');

describe('getProxiesFromSource(name, [options, ]cb)', function() {

	var sourcesBefore;

	beforeEach(function() {
		sourcesBefore = _.clone(ProxyLists.sourcer.sources);
	});

	afterEach(function() {
		ProxyLists.sourcer.sources = sourcesBefore;
	});

	it('should be a function', function() {
		expect(ProxyLists.getProxiesFromSource).to.be.a('function');
	});

	it('should throw an error if the source does not exist', function() {

		var name = 'does-not-exist';
		var thrownError;

		try {
			ProxyLists.getProxiesFromSource(name);
		} catch (error) {
			thrownError = error;
		}

		expect(thrownError).to.not.be.undefined;
		expect(thrownError instanceof Error).to.equal(true);
		expect(thrownError.message).to.equal('Data source does not exist: "' + name + '"');
	});

	it('should call getProxies() method of the specified source', function(done) {
		var name = 'some-source';
		ProxyLists.addSource(name, {
			getProxies: function() {
				_.defer(done);
				return new EventEmitter();
			}
		});
		ProxyLists.getProxiesFromSource(name);
	});

	/*
		When the options object is modified from within a source's getProxies() method.
		This could cause an error during the ProxyLists.filterProxies() method.
		For example when the 'countries' option is modified to some invalid value.
		See https://github.com/chill117/proxy-lists/issues/42 for more information.
	*/
	it('altering "options" in the source\'s getProxies(options) method', function(done) {

		var name = 'alter-options';

		ProxyLists.sourcer.sources = {};

		ProxyLists.addSource(name, {
			getProxies: function(options) {

				var emitter = new EventEmitter();
				var onData = _.bind(emitter.emit, emitter, 'data');

				options.countries = 'invalid';

				_.defer(onData, [
					{
						ipAddress: '127.0.0.1',
						port: 80
					}
				]);

				return emitter;
			}
		});

		var gettingProxies = ProxyLists.getProxiesFromSource(name);

		gettingProxies.on('data', function() {
			done();
		});
	});

	describe('requiredOptions', function() {

		it('should throw an error when missing a required option', function() {

			var name = 'has-required-options';
			var requiredOptions = {
				something: 'This is a required option!'
			};

			ProxyLists.addSource(name, {
				requiredOptions: requiredOptions,
				getProxies: function() {
					return new EventEmitter();
				}
			});

			var thrownError;

			try {
				ProxyLists.getProxiesFromSource(name);
			} catch (error) {
				thrownError = error;
			}

			expect(thrownError).to.not.be.undefined;
			expect(thrownError instanceof Error).to.equal(true);
			expect(thrownError.message).to.equal('Missing required option (`option.sourceOptions.' + name + '.something`): ' + requiredOptions.something);
		});
	});
});
