'use strict';

var _ = require('underscore');
var async = require('async');
var UserAgent = require('user-agents');

module.exports = {
	homeUrl: 'https://hidester.com/',
	defaultOptions: {
		numPages: 5,
	},
	getProxies: function(options) {
		var emitter = options.newEventEmitter();
		var done = function(error) {
			if (error) {
				emitter.emit('error', error);
			}
			emitter.emit('end');
		};
		var numPages = options.sample ? 1 : options.sourceOptions.numPages;
		var method = options.series ? 'timesSeries' : 'times';
		async[method](numPages, (n, next) => {
			var page = n + 1;
			this.getProxyPageViaApi(page, options, (error, proxies) => {
				if (error) {
					emitter.emit('error', error);
				} else {
					emitter.emit('data', proxies);
				}
				next();
			});
		}, done);
		return emitter;
	},
	getProxyPageViaApi: function(page, options, done) {
		var offset = page - 1;
		options.request({
			url: `https://hidester.com/proxydata/php/data.php?mykey=data&offset=${offset}&limit=10&orderBy=latest_check&sortOrder=DESC&country=&port=&type=undefined&anonymity=undefined&ping=undefined&gproxy=2`,
			headers: {
				'User-Agent': (new UserAgent()).toString(),
				'Referer': 'https://hidester.com/proxylist/',
			},
		}, function(error, response, data) {
			if (error) return done(error);
			if (response.statusCode >= 300 ) {
				error = new Error(data);
				error.status = response.statusCode;
				return done(error);
			}
			var proxies;
			try {
				console.log(data);
				data = JSON.parse(data);
				proxies = _.map(data || [], function(value) {
						return {
							ipAddress: value.IP,
							port: value.PORT,
							anonymityLevel: value.anonymity.toLowerCase(),
							protocols: [ value.type ],
						};
				});
			} catch (error) {
				return done(error);
			}
			done(null, proxies || []);
		});
	},
};
