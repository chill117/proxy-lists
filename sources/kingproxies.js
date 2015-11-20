'use strict';

var _ = require('underscore');
var request = require('request');

module.exports = {

	homeUrl: 'https://kingproxies.com/',

	getProxies: function(options, cb) {

		options || (options = {});

		if (process.env.PROXY_LISTS_KINGPROXIES_API_KEY) {
			options.kingproxies || (options.kingproxies = {});
			options.kingproxies = process.env.PROXY_LISTS_KINGPROXIES_API_KEY;
		}

		if (!options.kingproxies || !options.kingproxies.apiKey) {
			return cb(new Error('Missing API key for kingproxies. Provide API key via `options.kingproxies.apiKey`.'));
		}

		var requestOptions = {
			method: 'GET',
			url: 'https://kingproxies.com/api/v2/proxies.json',
			qs: {
				key: options.kingproxies.apiKey,
				type: options.anonymityLevels.join(','),
				protocols: options.protocols.join(','),
				alive: 'true',
				country_code: _.keys(options.countries).join(',').toUpperCase(),
			}
		};

		if (options.sample) {
			requestOptions.qs.new = 'true';
		}

		request(requestOptions, _.bind(function(error, response, data) {

			if (error) {
				return cb(error);
			}

			try {
				var proxies = this.parseResponseData(data);
			} catch (error) {
				return cb(error);
			}

			cb(null, proxies);

		}, this));
	},

	parseResponseData: function(data) {

		data = JSON.parse(data);

		if (data.message) {
			throw new Error(data.message);
		}

		return _.map(data.data.proxies, function(proxy) {

			var supportedProtocols = proxy.protocols;
			var protocol;

			if (_.contains(supportedProtocols, 'socks4') && _.contains(supportedProtocols, 'socks5')) {
				protocol = 'socks4/5';
			} else if (_.contains(supportedProtocols, 'socks4')) {
				protocol = 'socks4';
			} else if (_.contains(supportedProtocols, 'socks5')) {
				protocol = 'socks5';
			} else if (_.contains(supportedProtocols, 'https')) {
				protocol = 'https';
			} else if (_.contains(supportedProtocols, 'http')) {
				protocol = 'http';
			}

			return {
				ip_address: proxy.ip,
				port: parseInt(proxy.port),
				protocol: protocol,
				anonymityLevel: proxy.type,
				country: proxy.country_code.toLowerCase()
			};
		});
	}
};
