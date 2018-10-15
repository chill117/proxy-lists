'use strict';

var _ = require('underscore');

var convert = {
	anonymityLevels: {
		'Anonymous': 'anonymous',
		'No': 'transparent',
	},
};

module.exports = {
	homeUrl: 'https://www.cool-proxy.net/',
	defaultOptions: {
		numPagesToScrape: 10,
	},
	abstract: 'scraper-paginated-list',
	config: {
		startPageUrl: 'https://www.cool-proxy.net/proxies/http_proxy_list',
		selectors: {
			item: '#main table tbody tr',
			itemAttributes: {
				ipAddress: 'td:nth-child(1)',
				port: 'td:nth-child(2)',
				anonymityLevel: 'td:nth-child(6)',
			},
			nextLink: '#main table .pagination span.current + span a',
		},
		parseAttributes: {
			ipAddress: function(ipAddress) {
				var match = ipAddress.match(/([^)]+)$/);
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
