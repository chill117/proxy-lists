'use strict';

var _ = require('underscore');
var async = require('async');
var EventEmitter = require('events').EventEmitter || require('events');

module.exports = {

	homeUrl: 'https://kingproxies.com/',

	requiredOptions: {
		apiKey: 'You can get an API key for this service by creating an account at https://kingproxies.com/register'
	},

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
			url: 'https://kingproxies.com/api/v2/proxies.json',
			qs: {
				key: options.kingproxies && options.kingproxies.apiKey || null,
				type: options.anonymityLevels.join(','),
				protocols: options.protocols.join(','),
				alive: 'true',
				country_code: _.keys(options.countries).join(',').toUpperCase(),
			}
		};

		if (options.sample) {
			requestOptions.qs.new = 'true';
		}

		options.request(requestOptions, function(error, response, data) {

			if (error) {
				return cb(error);
			}

			cb(null, data);
		});
	},

	parseResponseData: function(data, cb) {

		try {

			data = JSON.parse(data);

			var proxies = _.map(data.data.proxies, function(proxy) {

				return {
					ipAddress: proxy.ip,
					port: parseInt(proxy.port),
					protocols: proxy.protocols,
					anonymityLevel: proxy.type.toLowerCase()
				};
			});

		} catch (error) {
			return cb(error);
		}

		cb(null, proxies);
	}
};
