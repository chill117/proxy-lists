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
			ipAddress: function(ipAddress) {
				if (!ipAddress) return null;
				if (ipAddress.indexOf(':') !== -1) {
					ipAddress = ipAddress.split(':')[0];
				}
				return ipAddress;
			},
			port: function(port) {
				if (!port) return null;
				if (port.indexOf(':') !== -1) {
					port = port.split(':')[1];
				}
				port = parseInt(port);
				if (_.isNaN(port)) return null;
				return port;
			},
			protocols: function(protocols) {
				if (!protocols) return null;
				protocols = protocols.trim();
				return protocols && [protocols.toLowerCase()] || null;
			},
			anonymityLevel: function(anonymityLevel) {
				if (!anonymityLevel) return null;
				return anonymityLevel.trim().toLowerCase();
			},
		},
	},
};
