'use strict';

var _ = require('underscore');

var convert = {
	anonymityLevels: {
		'Anonymous': 'anonymous',
		'No': 'transparent',
	},
};

var ProxyLists;

module.exports = {
	homeUrl: 'https://www.cool-proxy.net/',
	defaultOptions: {
		waitForValidData: {
			test: function(item) {
				ProxyLists = ProxyLists || require('../index');
				return ProxyLists.isValidProxy(item);
			},
			checkFrequency: 50,
			timeout: 2000,
		},
	},
	abstract: 'scraper-paginated-list',
	config: {
		startPageUrl: 'https://www.cool-proxy.net/',
		selectors: {
			item: '#main table tbody tr:not(:first-child)',
			itemAttributes: {
				ipAddress: 'td:nth-child(1)',
				port: 'td:nth-child(2)',
				anonymityLevel: 'td:nth-child(6)',
			},
			nextLink: '#main ul.pagination > li:nth-last-child(2) > a',
		},
		parseAttributes: {
			ipAddress: function(ipAddress) {
				if (!ipAddress) return null;
				var match = ipAddress && ipAddress.match(/([0-9.]+)/) || null;
				return match && match[1] || null;
			},
			port: function(port) {
				port = parseInt(port);
				if (_.isNaN(port)) return null;
				return port;
			},
			anonymityLevel: function(anonymityLevel) {
				return anonymityLevel && convert.anonymityLevels[anonymityLevel.trim()] || null;
			},
		},
	},
};
