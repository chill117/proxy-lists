'use strict';

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
	var targetNumProxies = 1000;

	before(function() {

		while (proxiesToFilter.length < targetNumProxies) {
			proxiesToFilter.push.apply(proxiesToFilter, proxies);
		}
	});

	it('filtering an array of ' + targetNumProxies + ' proxies', function(done) {

		this.timeout(15000);

		var bench = new Benchmark(function() {
			ProxyLists.filterProxies(proxiesToFilter, preparedOptions);
		});

		bench.on('complete', function(result) {

			if (result.target.error) {
				return done(result.target.error);
			}

			console.log(result.target.toString());
			done();
		});

		bench.run();
	});
});
