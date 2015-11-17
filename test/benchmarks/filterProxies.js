'use strict';

var _ = require('underscore');
var Benchmark = require('benchmark');

var ProxyLists = require('../../index');

describe('benchmark: filterProxies', function() {

	var proxies = require('../fixtures/proxies');

	var options = {
		countries: ['ca', 'us', 'sk'],
		protocols: ['http', 'https'],
		anonymityLevels: ['elite', 'anonymous']
	};

	var preparedOptions = ProxyLists.prepareOptions(options);

	var proxiesToFilter = [];

	before(function() {

		while (proxiesToFilter.length < 1000) {
			proxiesToFilter.push.apply(proxiesToFilter, proxies);
		}
	});

	var minHz = 2500;

	it('should run at least ' + minHz + ' ops/second', function(done) {

		this.timeout(15000);

		var i = 0;

		var bench = new Benchmark(function() {
			ProxyLists.filterProxies(proxiesToFilter, preparedOptions);
		});

		bench.on('complete', function(result) {

			if (result.target.error) {
				return done(result.target.error);
			}

			console.log(result.target.toString());

			if (!(result.target.hz >= minHz)) {
				return done(new Error('Expected at least ' + minHz + ' ops/second'));
			}

			done();
		});

		bench.run();
	});
});
