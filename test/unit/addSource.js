'use strict';

var _ = require('underscore');
var expect = require('chai').expect;

var ProxyLists = require('../../index');

describe('addSource(name, source)', function() {

	var sourcesBefore;

	beforeEach(function() {
		sourcesBefore = _.clone(ProxyLists.sourcer.sources);
	});

	afterEach(function() {
		ProxyLists.sourcer.sources = sourcesBefore;
	});

	var validDummySource = {
		homeUrl: 'https://somewhere',
		getProxies: function() {}
	};

	it('should be a function', function() {
		expect(ProxyLists.addSource).to.be.a('function');
	});

	it('should throw an error when source name is invalid', function() {
		var thrownError;
		try {
			ProxyLists.addSource('', validDummySource);
		} catch (error) {
			thrownError = error;
		}
		expect(thrownError).to.not.be.undefined;
		expect(thrownError instanceof Error).to.equal(true);
		expect(thrownError.message).to.equal('Invalid source name: ""');
	});

	it('should throw an error when a source already exists with the given name', function() {

		var sources = ProxyLists.listSources();
		var name = sources[0].name;
		var thrownError;

		try {
			ProxyLists.addSource(name, function() {});

		} catch (error) {
			thrownError = error;
		}

		expect(thrownError).to.not.be.undefined;
		expect(thrownError instanceof Error).to.equal(true);
		expect(thrownError.message).to.equal('Source already exists: "' + name + '"');
	});

	it('should throw an error when source is not an object', function() {

		var invalidSources = [ null, undefined, '', 400 ];

		_.each(invalidSources, function(invalidSource) {

			var thrownError;
			try {
				ProxyLists.addSource('some-new-source', invalidSource);
			} catch (error) {
				thrownError = error;
			}
			expect(thrownError).to.not.be.undefined;
			expect(thrownError instanceof Error).to.equal(true);
			expect(thrownError.message).to.equal('Expected "source" to be an object.');
		});
	});

	it('should throw an error when "getProxies" is not a function', function() {

		var thrownError;
		try {
			ProxyLists.addSource('some-new-source', {});
		} catch (error) {
			thrownError = error;
		}
		expect(thrownError).to.not.be.undefined;
		expect(thrownError instanceof Error).to.equal(true);
		expect(thrownError.message).to.equal('Source missing required method: "getProxies"');
	});

	it('should add source to list of sources', function() {

		var name = 'some-source';
		var source = {
			homeUrl: 'http://some-source.com/',
			requiredOptions: {
				apiKey: 'some sample error message for when this option is missing'
			},
			getProxies: function() {}
		};

		ProxyLists.addSource(name, source);

		var sources = ProxyLists.listSources();

		expect(_.findWhere(sources, { name: name })).to.deep.equal({
			name: name,
			homeUrl: source.homeUrl,
			defaultOptions: {},
			requiredOptions: source.requiredOptions
		});
	});
});
