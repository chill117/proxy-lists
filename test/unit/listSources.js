'use strict';

var _ = require('underscore');
var expect = require('chai').expect;

var ProxyLists = require('../../index');

describe('listSources([options])', function() {

	it('should be a function', function() {

		expect(ProxyLists.listSources).to.be.a('function');
	});

	it('should return an array of all available sources', function() {

		var sources = ProxyLists.listSources();
		var sourceNames = _.keys(require('../../sources'));

		expect(sources).to.be.an('array');
		expect(sources).to.have.length(sourceNames.length);

		_.each(sources, function(source) {
			expect(_.has(source, 'name')).to.equal(true);
			expect(source.name).to.be.a('string');
			expect(_.has(source, 'homeUrl')).to.equal(true);
		});
	});

	describe('options', function() {

		describe('sourcesWhiteList', function() {

			it('should return an array of only the sources in the "sourcesWhiteList"', function() {

				var sourcesWhiteLists = [
					[],
					['freeproxylists']
				];

				_.each(sourcesWhiteLists, function(sourcesWhiteList) {

					var sources = ProxyLists.listSources({ sourcesWhiteList: sourcesWhiteList });

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

				var sourcesBlackLists = [
					[],
					['freeproxylists']
				];

				_.each(sourcesBlackLists, function(sourcesBlackList) {

					var sources = ProxyLists.listSources({ sourcesBlackList: sourcesBlackList });

					expect(sources).to.be.an('array');
					expect(sources).to.have.length(_.keys(ProxyLists._sources).length - sourcesBlackList.length);

					_.each(sources, function(source) {
						expect(!_.contains(sourcesBlackList, source.name)).to.equal(true);
					});
				});
			});
		});
	});
});
