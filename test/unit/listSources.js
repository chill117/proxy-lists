'use strict';

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

				var sources;

				sources = ProxyLists.listSources({ sourcesWhiteList: [] });
				expect( sources ).to.have.length(0);

				sources = ProxyLists.listSources({ sourcesWhiteList: ['freeproxylists'] });
				expect(sources).to.have.length(1);
				expect(sources[0].name).to.equal('freeproxylists');
			});
		});

		describe('sourcesBlackList', function() {

			it('should return an array of only the sources not in the "sourcesBlackList"', function() {

				var sources;

				sources = ProxyLists.listSources({ sourcesBlackList: [] });
				expect( sources ).to.have.length(1);
				expect(sources[0].name).to.equal('freeproxylists');

				sources = ProxyLists.listSources({ sourcesBlackList: ['freeproxylists'] });
				expect(sources).to.have.length(0);
			});
		});
	});
});
