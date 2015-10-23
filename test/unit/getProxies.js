'use strict';

describe('getProxies([options, ]cb)', function() {

	it('should be a function', function() {

		expect(ProxyLists.getProxies).to.be.a('function');
	});

	it('should call getProxies() for all sources', function() {

		var testSources = ['somewhere', 'somewhere-else'];
		var called = [];

		var sourcesBefore = _.clone(ProxyLists._sources);

		ProxyLists._sources = {};

		_.each(testSources, function(name) {
			ProxyLists.addSource(name, {
				getProxies: function() {
					called.push(name);
				}
			});
		});

		ProxyLists.getProxies();

		_.each(_.keys(ProxyLists._sources), function(name) {
			expect(_.contains(called, name)).to.equal(true);
		});

		ProxyLists._sources = sourcesBefore;
	});
});
