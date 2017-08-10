'use strict';

var _ = require('underscore');
var async = require('async');
var EventEmitter = require('events').EventEmitter || require('events');

module.exports = {

	homeUrl: 'https://bitproxies.eu/',

	requiredOptions: {
		apiKey: 'You can get an API key for this service by creating an account at https://bitproxies.eu/'
	},

	getProxies: function(options) {

		options || (options = {});

		var emitter = new EventEmitter();

		var getProxyData = async.seq(
			this.getData.bind(this),
			this.parseResponseData.bind(this)
		);

		getProxyData(options, function(error, proxies) {

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

		options.request({
			method: 'GET',
			url: 'https://bitproxies.eu/api/v2/proxies',
			qs: {
				apiKey: options.bitproxies && options.bitproxies.apiKey || null,
				anonymityLevels: options.anonymityLevels.join(','),
				protocols: options.protocols.join(','),
				countries: _.keys(options.countries).join(','),
			}
		}, function(error, response, data) {

			if (error) {
				return cb(error);
			}

			if (response.statusCode >= 300) {
				error = new Error(data);
				error.status = response.statusCode;
				return cb(error);
			}

			cb(null, data);
		});
	},

	parseResponseData: function(data, cb) {

		try {

			data = JSON.parse(data);

			var proxies = _.map(data, function(proxy) {
				return _.pick(proxy, 'ipAddress', 'port', 'protocols', 'anonymityLevel');
			});

		} catch (error) {
			return cb(error);
		}

		cb(null, proxies);
	}
};
