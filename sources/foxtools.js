'use strict';

var _ = require('underscore');
var async = require('async');

var protocols = [
	[],										//
	[ 'http' ], 							//	1
	[ 'https' ], 							//	2
	[],										//
	[ 'socks4' ], 							//	4
	[],										//
	[],										//
	[],										//
	[ 'socks5' ],							//	8
	[],										//
	[],										//
	[],										//
	[],										//
	[],										//
	[],										//
	[ 'http', 'https', 'socks4', 'socks5' ]	//	15
];

var anonymityLevel = {
	None: 'transparent',
	Low: 'transparent',
	Medium: 'anonymous',
	High: 'elite',
	HighKeepAlive: 'elite',
	All: 'transparent',
	Unknown: 'transparent'
};

module.exports = {
	homeUrl: 'http://foxtools.ru/',
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
		this.getProxyPageViaApi(1, options, (error, proxies, pageCount) => {
			if (error) return done(error);
			emitter.emit('data', proxies);
			var numPages = options.sample ? 1 : Math.min(options.sourceOptions.numPages, pageCount)  - 1;
			if (numPages <= 0) return done();
			var method = options.series ? 'timesSeries' : 'times';
			async[method](numPages, (n, next) => {
				var page = n + 2;
				this.getProxyPageViaApi(page, options, (error, proxies) => {
					if (error) {
						emitter.emit('error', error);
					} else {
						emitter.emit('data', proxies);
					}
					next();
				});
			}, done);
		});
		return emitter;
	},
	getProxyPageViaApi: function(page, options, done) {
		options.request({
			url: 'http://api.foxtools.ru/v2/Proxy.json?page=' + page,
		}, function(error, response, data) {
			if (error) return done(error);
			if (response.statusCode >= 300 ) {
				error = new Error(data);
				error.status = response.statusCode;
				return done(error);
			}
			var proxies, pageCount;
			try {
				data = JSON.parse(data);
				pageCount = data.response.pageCount;
				proxies = _.map(data.response.items || [], function(value) {
					return {
						ipAddress: value.ip,
						port: value.port,
						anonymityLevel: anonymityLevel[value.anonymity],
						protocols: protocols[value.type],
					};
				});
			} catch (error) {
				return done(error);
			}
			done(null, proxies || [], pageCount);
		});
	},
};
