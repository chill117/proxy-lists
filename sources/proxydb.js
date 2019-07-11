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
			nextLink: '.pagination button',
		},
		parseAttributes: {
			ipAddress: function(text) {
				return text.split(':')[0];
			},
			port: function(text) {
				var port = parseInt(text.split(':')[1]);
				if (_.isNaN(port)) return null;
				return port;
			},
			protocols: function(protocols) {
				protocols = protocols.trim();
				return protocols && [protocols.toLowerCase()] || null;
			},
			anonymityLevel: function(anonymityLevel) {
				return anonymityLevel.trim().toLowerCase();
			},
		},
	},
};
