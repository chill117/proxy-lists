'use strict';

var _ = require('underscore');

module.exports = {
	homeUrl: 'https://premproxy.com/',
	abstract: 'scraper-paginated-list',
	defaultOptions: {
		nextPageDelay: 500,
	},
	config: {
		startPageUrl: 'https://premproxy.com/list/',
		selectors: {
			item: '#proxylistt tbody tr[class]',
			itemAttributes: {
				ipAddress: 'td:first-child',
				port: 'td:first-child span:last-child',
				anonymityLevel: 'td:nth-child(2)',
			},
			nextLink: '#navbar ul.pagination li:last-child > a',
		},
		parseAttributes: {
			ipAddress: function(text) {
				return text.split(' ')[1].split(':')[0];
			},
			port: function(port) {
				port = parseInt(port);
				if (_.isNaN(port)) return null;
				return port;
			},
			anonymityLevel: function(anonymityLevel) {
				return anonymityLevel.trim().split(': ')[1];
			},
		},
	},
};
