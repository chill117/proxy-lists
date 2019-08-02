'use strict';

var _ = require('underscore');
var expect = require('chai').expect;

var ProxyLists = require('../../index');

describe('listSources([options])', function() {

	afterEach(function() {
		ProxyLists._sources = [];
	});

	it('should return an array of all available sources', function() {

		var sourceNames = ['one', 'two', 'three'];
		_.each(sourceNames, function(name) {
			ProxyLists.addSource(name, {
				getProxies: _.noop,
			});
		});
		var sources = ProxyLists.listSources({ sourcesDir: null });
		expect(sources).to.be.an('array');
		expect(sources).to.have.length(sourceNames.length);
		_.each(sources, function(source) {
			expect(source).to.have.property('name');
			expect(source.name).to.be.a('string');
			expect(source).to.have.property('homeUrl');
		});
	});

	describe('options', function() {

		describe('sourcesWhiteList', function() {

			it('should return an array of only the sources in the "sourcesWhiteList"', function() {

				var sourceNames = ['one', 'two', 'three'];
				_.each(sourceNames, function(name) {
					ProxyLists.addSource(name, {
						getProxies: _.noop,
					});
				});
				var sourcesWhiteLists = [
					[],
					['two']
				];
				_.each(sourcesWhiteLists, function(sourcesWhiteList) {
					var sources = ProxyLists.listSources({
						sourcesDir: null,
						sourcesWhiteList: sourcesWhiteList,
					});
					expect(sources).to.be.an('array');
					expect(sources).to.have.length(sourcesWhiteList.length);
					_.each(sources, function(source) {
						expect(_.contains(sourcesWhiteList, source.name)).to.equal(true);
					});
				});
			});
		});

		describe('sourcesBlackList', function() {

			it('should return an array of only the sources not in the "sourcesBlackList"', function() {

				var sourceNames = ['one', 'two', 'three'];
				_.each(sourceNames, function(name) {
					ProxyLists.addSource(name, {
						getProxies: _.noop,
					});
				});
				var sourcesBlackLists = [
					[],
					['three']
				];
				_.each(sourcesBlackLists, function(sourcesBlackList) {
					var sources = ProxyLists.listSources({
						sourcesBlackList: sourcesBlackList,
						sourcesDir: null,
					});
					expect(sources).to.be.an('array');
					expect(sources).to.have.length(sourceNames.length - sourcesBlackList.length);
					_.each(sources, function(source) {
						expect(!_.contains(sourcesBlackList, source.name)).to.equal(true);
					});
				});
			});
		});
	});
});
