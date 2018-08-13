'use strict';

var _ = require('underscore');

module.exports = {
	homeUrl: 'http://proxydb.net/',
	defaultOptions: {
		numPagesToScrape: 10,
	},
	abstract: 'scraper-paginated-list',
	config: {
		startPageUrl: 'http://proxydb.net/',
		selectors: {
			item: 'table tbody tr',
			itemAttributes: {
				ipAddress: 'td:first-child a',
				port: 'td:first-child a',
				protocols: 'td:nth-child(5)',
				anonymityLevel: 'td:nth-child(6)',
			},
			nextLink: '.pagination li:nth-child(2) a',
		},
		parseAttributes: {
			ipAddress: '(.+):[0-9]+',
			port: function(port) {
				var match = port.match(/.+:([0-9]+)/);
				if (!match || !match[1]) return null;
				port = parseInt(match[1]);
				if (_.isNaN(port)) return null;
				return port;
			},
			protocols: function(protocols) {
				return [protocols.trim().toLowerCase()];
			},
			anonymityLevel: function(anonymityLevel) {
				return anonymityLevel.trim().toLowerCase();
			},
		},
	},
};
