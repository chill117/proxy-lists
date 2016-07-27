'use strict';

var _ = require('underscore');
var async = require('async');
var EventEmitter = require('events').EventEmitter || require('events');
var request = require('request');

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
			var data = result.data;
			var options = result.options || {};
			var countriesKeys = _.keys(options.countries || {});
			var anonymityCodeMap = {
				'n': 'transparent',
				'n!': 'transparent',
				'a': 'anonymous',
				'h': 'elite'
			};
			var str = (data + '').toLowerCase();
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

				var proxyItem = {
					ipAddress: addrParts[0],
					port: parseInt(addrParts[1]),
					protocols: props[2] ? ['http', 'https'] : ['http'],
					anonymityLevel: anonymityCodeMap[props[1]],
					country: props[0]
				};
				if ( !result.options || (countriesKeys && _.contains(countriesKeys, proxyItem.country))
					&& (!options.anonymityLevels || options.anonymityLevels && _.contains(options.anonymityLevels, proxyItem.anonymityLevel))
					&& (!options.protocols || options.protocols && _.intersection(options.protocols, proxyItem.protocols).length) ) {
					proxies.push(proxyItem);
				}
			}

		} catch (error) {
			return cb(error);
		}

		cb(null, proxies);
	}
};
