'use strict';

var async = require('async');
var _ = require('underscore');

var protocols = [
	[],					//
	[ 'http' ], 		//	1
	[ 'https' ], 		//	2
	[],					//
	[ 'socks5' ], 		//	4
	[ 'http', 'https' ] //	5
];

var anonymityLevel = [
	'transparent',		//	0
	null,				//
	'anonymous'			//	2
];

module.exports = {
	homeUrl: 'https://checkerproxy.net/',
	defaultOptions: {
		numDaysOfArchives: 14,
	},
	getProxies: function(options) {
		var emitter = options.newEventEmitter();
		var now = Date.now();
		var numDaysOfArchives = options.sample ? 3 : options.sourceOptions.numDaysOfArchives;
		var archiveDates = _.map(new Array(numDaysOfArchives), function(currentValue, index) {
			return new Date(now - index * 86400 * 1000).toISOString().split('T')[0];
		});
		var method = options.series ? 'eachSeries' : 'each';
		console.log({method, numDaysOfArchives, archiveDates})
		async[method](archiveDates, function(archiveDate, next) {
			options.request({
				url: 'https://checkerproxy.net/api/archive/' + archiveDate,
			}, function(error, response, data) {
				if (error) {
					emitter.emit('error', error);
				} else if (response.statusCode >= 300) {
					error = new Error(data);
					error.status = response.statusCode;
					emitter.emit('error', error);
				} else {
					try {
						const proxies = _.map(JSON.parse(data), function(value) {
							value.addr = value.addr.split(':');
							return {
								ipAddress: value.addr[0],
								port: value.addr[1],
								anonymityLevel: anonymityLevel[value.kind],
								protocols: protocols[value.type],
								country: value.addr_geo_iso,
							};
						});
						emitter.emit('data', proxies);
					} catch (error) {
						emitter.emit('error', error);
					}
				}
				next();
			});
		}, function() {
			emitter.emit('end');
		});
		return emitter;
	}
};
