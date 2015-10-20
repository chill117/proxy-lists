'use strict';

describe('getProxies([options, ]cb)', function() {

	it('should be a function', function() {

		expect(ProxyLists.getProxies).to.be.a('function');
	});

	it('should call getProxies() for all sources', function() {

		var testSources = ['somewhere', 'somewhere-else'];
		var called = [];

		_.each(testSources, function(name) {
			ProxyLists.addSource(name, {
				getProxies: function() {
					called.push(name);
				}
			});
		});

		ProxyLists.getProxies();

		_.each(testSources, function(name) {
			expect(_.contains(called, name)).to.equal(true);
		});

		// Clean-up.
		_.each(testSources, function(name) {
			delete ProxyLists._sources[name];
		});
	});
});
