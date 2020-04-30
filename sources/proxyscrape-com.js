'use strict';

var _ = require('underscore');
var async = require('async');

var lists = [
	{
		url: 'https://api.proxyscrape.com/?request=getproxies&proxytype=socks4&timeout=10000&country=all',
		anonymityLevel: 'elite',
		protocols: [ 'socks4' ],
	},
	{
		url: 'https://api.proxyscrape.com/?request=getproxies&proxytype=socks5&timeout=10000&country=all',
		anonymityLevel: 'elite',
		protocols: [ 'socks5' ],
	},
	{
		url: 'https://api.proxyscrape.com/?request=getproxies&proxytype=http&ssl=no&timeout=10000&country=all&anonymity=elite',
		anonymityLevel: 'elite',
		protocols: [ 'http' ],
	},
	{
		url: 'https://api.proxyscrape.com/?request=getproxies&proxytype=http&ssl=no&timeout=10000&country=all&anonymity=anonymous',
		anonymityLevel: 'anonymous',
		protocols: [ 'http' ],
	},
	{
		url: 'https://api.proxyscrape.com/?request=getproxies&proxytype=http&ssl=no&timeout=10000&country=all&anonymity=transparent',
		anonymityLevel: 'transparent',
		protocols: [ 'http' ],
	},
	{
		url: 'https://api.proxyscrape.com/?request=getproxies&proxytype=http&ssl=yes&timeout=10000&country=all&anonymity=elite',
		anonymityLevel: 'elite',
		protocols: [ 'https' ],
	},
	{
		url: 'https://api.proxyscrape.com/?request=getproxies&proxytype=http&ssl=yes&timeout=10000&country=all&anonymity=anonymous',
		anonymityLevel: 'anonymous',
		protocols: [ 'https' ],
	},
	{
		url: 'https://api.proxyscrape.com/?request=getproxies&proxytype=http&ssl=yes&timeout=10000&country=all&anonymity=transparent',
		anonymityLevel: 'transparent',
		protocols: [ 'https' ],
	},
];

module.exports = {
	homeUrl: 'https://www.proxyscrape.com/',
	getProxies: function(options) {
		var emitter = options.newEventEmitter();
		var method = options.series ? 'eachSeries' : 'each';
		if (options.sample) {
			lists = lists.slice(0, 2);
		}
		async[method](lists, function(list, next) {
			options.request({
				url: list.url,
			}, function(error, response, data) {
				if (error) {
					emitter.emit('error', error);
				} else if (response.statusCode >= 300 ) {
					error = new Error(data);
					error.status = response.statusCode;
					emitter.emit('error', error);
				} else {
					try {
						var proxies = _.map(data.trim().split('\r\n'), function(line) {
							var parts = line.trim().split(':');
							return {
								ipAddress: parts[0],
								port: parts[1],
								anonymityLevel: list.anonymityLevel,
								protocols: list.protocols,
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
	},
};
