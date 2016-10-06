'use strict';

var async = require('async');
var EventEmitter = require('events').EventEmitter || require('events');
var request = require('request');

var anonymityCodeMap = {
	'n': 'transparent',
	'n!': 'transparent',
	'a': 'anonymous',
	'h': 'elite'
};

module.exports = {

	homeUrl: 'http://txt.proxyspy.net/proxy.txt',

	getProxies: function(options) {

		options || (options = {});

		var emitter = new EventEmitter();

		var fn = async.seq(
			this.getData,
			this.parseResponseData
		);

		fn(options, function(error, proxies) {

			if (error) {
				emitter.emit('error', error);
			} else {
				emitter.emit('data', proxies);
			}

			emitter.emit('end');
		});

		return emitter;
	},

	getData: function(options, cb) {

		var requestOptions = {
			method: 'GET',
			url: 'http://txt.proxyspy.net/proxy.txt',
		};

		request(requestOptions, function(error, response, data) {

			if (error) {
				return cb(error);
			}

			if (response.statusCode >= 300) {
				error = new Error(data);
				error.status = response.statusCode;
				return cb(error);
			}

			cb(null, { data: data, options: options });
		});
	},

	parseResponseData: function(result, cb) {

		try {

			var str = (result.data + '').toLowerCase();
			var lines = str.split('\n');
			lines.shift(); //remove header text lines
			lines.shift();
			lines.shift();
			lines.pop(); //remove footer text lines
			lines.pop();

			var oneProxyLine;
			var proxies = [];

			while ((oneProxyLine = lines.pop()) !== undefined) {

				var mainParts = oneProxyLine.split(' ');
				var addrParts = mainParts[0].split(':');
				var props = mainParts[1] && mainParts[1].split('-');

				proxies.push({
					ipAddress: addrParts[0],
					port: parseInt(addrParts[1]),
					protocols: props[2] ? ['http', 'https'] : ['http'],
					anonymityLevel: anonymityCodeMap[props[1]],
					country: props[0]
				});
			}

		} catch (error) {
			return cb(error);
		}

		cb(null, proxies);
	}
};
